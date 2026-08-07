/**
 * 認証 API（Backend `/api/v1/auth/*`）。
 *
 * Backend は Supabase(GoTrue) への認証プロキシ。login / refresh は
 * `AuthSession`（トークン一式 + 公開ユーザー）を返し、logout は 204。
 *
 * トークンの保存と `Authorization` 付与は #28（setRequestInterceptor 連携）で行う。
 * 本モジュールは呼び出しのみを担い、状態は持たない。
 */
import { apiRequest } from "../../../api";
import type { AuthSession, SignInRequest } from "../../../types";

const AUTH_BASE = "/api/v1/auth";

/**
 * メール + パスワードでログインする。
 *
 * 認証失敗（メール/パスワード不一致）は Backend が 401 を返し、[ApiError] を throw する。
 */
export function login(credentials: SignInRequest): Promise<AuthSession> {
  return apiRequest<AuthSession>(`${AUTH_BASE}/login`, {
    method: "POST",
    json: credentials,
  });
}

/**
 * リフレッシュトークンでセッションを更新する。
 *
 * 期限切れ・失効したトークンは Backend が 401 を返し、[ApiError] を throw する。
 */
export function refresh(refreshToken: string): Promise<AuthSession> {
  return apiRequest<AuthSession>(`${AUTH_BASE}/refresh`, {
    method: "POST",
    json: { refreshToken },
  });
}

/**
 * ログアウトする（サーバー側でアクセストークンを失効させる）。
 *
 * Backend は `Authorization: Bearer <accessToken>` ヘッダを見る。付与は #28 の
 * request interceptor が担うため、未ログイン状態で呼ぶと 401（[ApiError]）になる。
 */
export function logout(): Promise<void> {
  return apiRequest<void>(`${AUTH_BASE}/logout`, { method: "POST" });
}
