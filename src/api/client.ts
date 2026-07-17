/**
 * Backend API 向け fetch 薄ラッパ（共通基盤）。
 *
 * - baseURL: VITE_API_BASE_URL または同一オリジン（dev プロキシ）
 * - 認証: setRequestInterceptor で Authorization 付与（実装予定）
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

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  requestInterceptor?.(headers);

  return fetch(url, { ...init, headers });
}
