import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth";
import { ForbiddenScreen } from "../layouts";
import { ROUTES } from "./paths";

/**
 * 未ログインならログイン画面へリダイレクトする（dev / prod とも有効）。
 *
 * ログイン後に元の画面へ戻せるよう、遷移元を state.from に載せる（LoginScreen で利用）。
 * リロード時のログイン状態は AuthProvider が sessionStorage から同期復元するため、
 * 復元済みなら弾かれない。
 */
export function AuthGuard() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
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
