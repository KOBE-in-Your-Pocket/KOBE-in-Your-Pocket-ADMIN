import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth";
import { ForbiddenScreen } from "../layouts";
import { ROUTES } from "./paths";

/**
 * 未ログインならログイン画面へリダイレクトする。
 *
 * ログイン後に元の画面へ戻せるよう、遷移元を state.from に載せる（#30 で利用）。
 * dev ビルドでは認可を緩めて開発しやすくしている（本番での有効化は #31）。
 */
export function AuthGuard() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated && import.meta.env.PROD) {
    return (
      <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
}

/**
 * admin 専用ルート用。権限が無ければ 403 画面をその場に表示する。
 *
 * リダイレクトではなくインライン表示にすることで、サイドバー・ヘッダーと
 * URL を保ったまま権限不足を伝える（ADMIN-image 準拠）。
 */
export function AdminGuard() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <ForbiddenScreen />;
  }

  return <Outlet />;
}
