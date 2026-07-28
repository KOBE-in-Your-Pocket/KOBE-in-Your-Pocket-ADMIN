import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  clearAuthTokens,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setRefreshToken,
  setStoredUser,
} from "../../lib/storage";
import type { AuthSession } from "../../types";
import type { Role } from "../../types/role";
import { roleFromAccessToken } from "./jwt";

export type AuthUser = {
  id: string;
  name: string;
  role: Role;
};

/**
 * リロード時に sessionStorage からセッションを復元する。
 *
 * 表示情報（id / name）は保存スナップショットから、ロールは正であるアクセス
 * トークン（JWT）から解決し直す。トークンか保存ユーザーが欠ければ未ログイン扱い。
 */
function restoreUser(): AuthUser | null {
  const token = getAccessToken();
  const stored = getStoredUser();
  if (token === null || stored === null) return null;
  return {
    id: stored.id,
    name: stored.name,
    role: roleFromAccessToken(token),
  };
}

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /**
   * 実 API のログイン / リフレッシュ結果からセッションを確立する。
   *
   * アクセス・リフレッシュトークンを保存し、ロールを JWT の `app_metadata.role`
   * から解決して user を設定する。accessToken か user が欠ける場合は確立せず null。
   * 管理画面の利用可否（operator/admin）判定は呼び出し側（#30）で行う。
   */
  establishSession: (session: AuthSession) => AuthUser | null;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // マウント時に保存済みセッションから同期復元する（リロードでログイン状態を保つ）。
  const [user, setUser] = useState<AuthUser | null>(restoreUser);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      establishSession: (session) => {
        const { accessToken, refreshToken, user: publicUser } = session;
        if (accessToken === null || publicUser === null) return null;

        const authUser: AuthUser = {
          id: publicUser.id,
          name: publicUser.name,
          role: roleFromAccessToken(accessToken),
        };

        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setStoredUser(authUser);
        setUser(authUser);
        return authUser;
      },
      logout: () => {
        clearAuthTokens();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
