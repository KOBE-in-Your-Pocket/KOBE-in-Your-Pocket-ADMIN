import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isApiError } from "../../api";
import { Spinner } from "../../components";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setAccessToken,
  setRefreshToken,
  setStoredUser,
} from "../../lib/storage";
import type { AuthSession } from "../../types";
import type { Role } from "../../types/role";
import { refresh } from "./api/auth-api";
import styles from "./AuthProvider.module.css";
import { roleFromAccessToken } from "./jwt";

export type AuthUser = {
  id: string;
  name: string;
  role: Role;
};

/**
 * sessionStorage のスナップショットからセッションを即時復元する（起動時のちらつき防止）。
 *
 * 表示情報（id / name）は保存スナップショットから、ロールは正であるアクセス
 * トークン（JWT）から解決する。起動時にはこの値を refresh で検証・更新する。
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
   * アクセス・リフレッシュトークンとユーザーを保存し、ロールを JWT の
   * `app_metadata.role` から解決して user を設定する。accessToken か user が
   * 欠ける場合は確立せず null。管理画面の利用可否判定は呼び出し側で行う。
   */
  establishSession: (session: AuthSession) => AuthUser | null;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // 起動時はスナップショットから即時復元しておく（refresh で検証・更新する）。
  const [user, setUser] = useState<AuthUser | null>(restoreUser);
  // 保存済み refreshToken があれば、その有効性を検証し終えるまで初期化中とする。
  const [isInitializing, setIsInitializing] = useState(
    () => getRefreshToken() !== null,
  );

  const establishSession = useCallback(
    (session: AuthSession): AuthUser | null => {
      const { accessToken, refreshToken, user: publicUser } = session;
      // 3 点が揃わない不完全なセッションは確立しない。特に refreshToken を null で
      // 上書き保存すると以降の起動時 refresh が成立しなくなるため弾く。
      if (
        accessToken === null ||
        refreshToken === null ||
        publicUser === null
      ) {
        return null;
      }

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
    [],
  );

  const logout = useCallback(() => {
    clearAuthTokens();
    setUser(null);
  }, []);

  // 起動時に refreshToken でセッションを検証・更新する（StrictMode の二重実行を ref で防ぐ）。
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const refreshToken = getRefreshToken();
    if (refreshToken === null) {
      setIsInitializing(false);
      return;
    }

    refresh(refreshToken)
      .then((session) => {
        establishSession(session);
      })
      .catch((error: unknown) => {
        // 失効・不正（ApiError）はセッション破棄。ネットワーク断（NetworkError）は
        // 一時的なので同期復元したセッションを維持する。
        if (isApiError(error)) {
          clearAuthTokens();
          setUser(null);
        }
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, [establishSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      establishSession,
      logout,
    }),
    [user, establishSession, logout],
  );

  // セッション検証が終わるまではローディングを出し、保護画面やログイン画面の
  // ちらつき（未検証状態での誤表示）を防ぐ。
  if (isInitializing) {
    return (
      <div className={styles.initializing}>
        <Spinner size="lg" label="読み込み中" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
