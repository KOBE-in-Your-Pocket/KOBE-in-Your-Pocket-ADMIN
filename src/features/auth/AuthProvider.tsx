import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  clearAuthTokens,
  setAccessToken,
  setRefreshToken,
} from "../../lib/storage";
import type { AuthSession } from "../../types";
import type { Role } from "../../types/role";
import { roleFromAccessToken } from "./jwt";

export type AuthUser = {
  id: string;
  name: string;
  role: Role;
};

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
  const [user, setUser] = useState<AuthUser | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      establishSession: (session) => {
        const { accessToken, refreshToken, user: publicUser } = session;
        if (accessToken === null || publicUser === null) return null;

        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        const authUser: AuthUser = {
          id: publicUser.id,
          name: publicUser.name,
          role: roleFromAccessToken(accessToken),
        };
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
