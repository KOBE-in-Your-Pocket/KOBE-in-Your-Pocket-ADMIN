/**
 * 認証トークンの永続化。
 *
 * タブを閉じたら破棄したいので sessionStorage を使う（localStorage にはしない）。
 * - accessToken: 全 API リクエストの `Authorization` に載る（本ファイル + interceptor）。
 * - refreshToken: accessToken 失効時の再取得に使う（auth-api.refresh / #29）。
 */
const ACCESS_TOKEN_KEY = "admin.accessToken";
const REFRESH_TOKEN_KEY = "admin.refreshToken";

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  writeOrRemove(ACCESS_TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null): void {
  writeOrRemove(REFRESH_TOKEN_KEY, token);
}

/** アクセス・リフレッシュ両トークンを破棄する（ログアウト・認証失敗時）。 */
export function clearAuthTokens(): void {
  setAccessToken(null);
  setRefreshToken(null);
}

function writeOrRemove(key: string, value: string | null): void {
  if (value === null) {
    sessionStorage.removeItem(key);
    return;
  }
  sessionStorage.setItem(key, value);
}
