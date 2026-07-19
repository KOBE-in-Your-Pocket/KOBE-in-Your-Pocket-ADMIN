import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth";
import { ROUTES } from "./paths";

/** 未ログイン時は /login へ（Phase 1 で JWT 連携後に有効化）。 */
export function AuthGuard() {
  const { isAuthenticated } = useAuth();

  // Phase 1 まで開発用に認可ガードを緩める
  if (!isAuthenticated && import.meta.env.PROD) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
}

/** admin 専用ルート用（Phase 1: ユーザー削除等）。 */
export function AdminGuard() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <Navigate to={ROUTES.forbidden} replace />;
  }

  return <Outlet />;
}
