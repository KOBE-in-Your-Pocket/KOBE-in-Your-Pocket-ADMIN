import type { ApiErrorResponse } from "../types";
import { ApiError, NetworkError } from "./errors";

/**
 * Backend API 向け fetch 薄ラッパ（共通基盤）。
 *
 * - baseURL: VITE_API_BASE_URL または同一オリジン（dev プロキシ）
 * - 認証: setRequestInterceptor で Authorization 付与
 */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return window.location.origin;
}

type RequestInterceptor = (headers: Headers) => void;
let requestInterceptor: RequestInterceptor | null = null;

export function setRequestInterceptor(
  interceptor: RequestInterceptor | null,
): void {
  requestInterceptor = interceptor;
}

/**
 * `Authorization: Bearer <token>` を付与する interceptor を作る。
 *
 * トークンの取得元は呼び出し側が決める（保存・更新は #28 で lib/storage と結線する）。
 * getToken が null を返す間はヘッダを付けない＝未ログイン扱い。
 */
export function createBearerInterceptor(
  getToken: () => string | null,
): RequestInterceptor {
  return (headers) => {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  };
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  requestInterceptor?.(headers);

  return fetch(url, { ...init, headers });
}

export type ApiRequestInit = Omit<RequestInit, "body"> & {
  /** JSON ボディ。指定すると Content-Type を付けて JSON.stringify する。 */
  json?: unknown;
  /** JSON 以外を送る場合の生ボディ。json と併用しない。 */
  body?: BodyInit | null;
};

/**
 * JSON API を叩き、成功時はパース済みのレスポンスを返す。
 *
 * 非 2xx は [ApiError]、fetch 自体の失敗は [NetworkError] を throw する。
 * 204 / 205 / 本文なしの場合は undefined を返すため、`apiRequest<void>(…)` として使う。
 */
export async function apiRequest<T>(
  path: string,
  init: ApiRequestInit = {},
): Promise<T> {
  const { json, ...rest } = init;
  const headers = new Headers(rest.headers);
  headers.set("Accept", "application/json");

  let body = rest.body;
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(json);
  }

  let response: Response;
  try {
    response = await apiFetch(path, { ...rest, headers, body });
  } catch (cause) {
    throw new NetworkError(
      "ネットワークに接続できませんでした。通信環境を確認してください。",
      { cause },
    );
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  return (await readJsonBody<T>(response)) as T;
}

/** 応答本文から ApiError を組み立てる。本文が空・非 JSON でも必ず ApiError を返す。 */
async function toApiError(response: Response): Promise<ApiError> {
  const body = await readErrorBody(response);

  if (body) {
    return new ApiError(response.status, body.message, {
      reason: body.error,
      violations: body.violations ?? [],
      body,
    });
  }

  // 401/403 は Spring Security の既定応答で本文が空になる（Backend に専用ハンドラが無い）。
  return new ApiError(response.status, fallbackMessage(response), {
    reason: response.statusText,
  });
}

async function readErrorBody(
  response: Response,
): Promise<ApiErrorResponse | null> {
  const parsed = await readJsonBody<unknown>(response);
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    typeof (parsed as ApiErrorResponse).message === "string"
  ) {
    return parsed as ApiErrorResponse;
  }
  return null;
}

/** 本文が空・非 JSON なら undefined。JSON パース失敗を呼び出し側に投げない。 */
async function readJsonBody<T>(response: Response): Promise<T | undefined> {
  if (response.status === 204 || response.status === 205) return undefined;

  const text = await response.text().catch(() => "");
  if (text.trim() === "") return undefined;

  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined;
  }
}

function fallbackMessage(response: Response): string {
  switch (response.status) {
    case 401:
      return "ログインが必要です。再度ログインしてください。";
    case 403:
      return "この操作を行う権限がありません。";
    case 404:
      return "対象が見つかりませんでした。";
    default:
      return response.status >= 500
        ? "サーバーでエラーが発生しました。時間をおいて再度お試しください。"
        : `リクエストに失敗しました（HTTP ${response.status}）。`;
  }
}
