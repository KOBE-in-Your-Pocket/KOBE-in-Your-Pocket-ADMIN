import type { Role } from "../types/role";

/**
 * 認証セッションの永続化。
 *
 * タブを閉じたら破棄したいので sessionStorage を使う（localStorage にはしない）。
 * リロード（同一タブ）では保持されるため、ページ再読込後もログイン状態を復元できる。
 * - accessToken: 全 API リクエストの `Authorization` に載る（interceptor）。
 * - refreshToken: accessToken 失効時の再取得に使う。
 * - user: リロード時に表示情報（id / name）を即時復元するためのスナップショット。
 *   ロールの正はあくまで JWT なので、復元時はトークンから解決し直す。
 */
const ACCESS_TOKEN_KEY = "admin.accessToken";
const REFRESH_TOKEN_KEY = "admin.refreshToken";
const USER_KEY = "admin.user";

/** 復元用に保存する最小ユーザー情報。 */
export type StoredUser = {
  id: string;
  name: string;
  role: Role;
};

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

export function getStoredUser(): StoredUser | null {
  const raw = sessionStorage.getItem(USER_KEY);
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as StoredUser).id === "string" &&
      typeof (parsed as StoredUser).name === "string" &&
      typeof (parsed as StoredUser).role === "string"
    ) {
      return parsed as StoredUser;
    }
    return null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser | null): void {
  if (user === null) {
    sessionStorage.removeItem(USER_KEY);
    return;
  }
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** セッション（トークン＋保存ユーザー）を破棄する。ログアウト・認証失敗時に使う。 */
export function clearAuthTokens(): void {
  setAccessToken(null);
  setRefreshToken(null);
  setStoredUser(null);
}

function writeOrRemove(key: string, value: string | null): void {
  if (value === null) {
    sessionStorage.removeItem(key);
    return;
  }
  sessionStorage.setItem(key, value);
}
