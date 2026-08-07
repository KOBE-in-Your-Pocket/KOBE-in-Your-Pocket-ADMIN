import type { ApiErrorResponse, FieldViolation } from "../types";

/**
 * Backend が非 2xx を返したときのエラー。
 *
 * Backend の `GlobalExceptionHandler` は 400/404/502 等で `ApiErrorResponse` を返すが、
 * 401/403 は Spring Security の既定応答で **本文が空**になる。そのため [body] は null を取り、
 * その場合 [message] はステータスから組み立てたフォールバック文言になる。
 */
export class ApiError extends Error {
  /** HTTP ステータスコード。 */
  readonly status: number;

  /** ステータスの reason phrase（例: "Bad Request"）。本文が無い場合は空文字。 */
  readonly reason: string;

  /** バリデーションエラーの項目別内訳。無い場合は空配列。 */
  readonly violations: FieldViolation[];

  /** パースできた場合の生のエラーレスポンス。本文が空・非 JSON の場合は null。 */
  readonly body: ApiErrorResponse | null;

  constructor(
    status: number,
    message: string,
    options: {
      reason?: string;
      violations?: FieldViolation[];
      body?: ApiErrorResponse | null;
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.reason = options.reason ?? "";
    this.violations = options.violations ?? [];
    this.body = options.body ?? null;
  }

  /** 未認証。トークン切れ・未ログイン。ログイン画面へ誘導する。 */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** 権限不足。ロールが足りない。403 画面へ誘導する。 */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** リトライしても結果が変わらないクライアントエラー（429 を除く）。 */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500 && this.status !== 429;
  }
}

/** ネットワーク到達不能・CORS 拒否など、応答が得られなかった場合のエラー。 */
export class NetworkError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "NetworkError";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}
