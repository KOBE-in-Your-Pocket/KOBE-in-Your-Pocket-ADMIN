import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { Badge, Button } from "../../components";
import { useAuth } from "../../features/auth";
import { ROUTES } from "../../routes/paths";

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <p className="sidebar-title">KOBE Admin</p>
        <nav className="sidebar-nav">
          <Link
            to={ROUTES.dashboard}
            className={location.pathname === ROUTES.dashboard ? "active" : ""}
          >
            ダッシュボード
          </Link>
        </nav>
      </aside>
      <div className="main-column">
        <header className="app-header">
          <span className="muted">{user?.name ?? "未ログイン"}</span>
          {user !== null && (
            <Badge tone={user.role === "operator" ? "operator" : "primary"}>
              {user.role}
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={logout}>
            ログアウト
          </Button>
        </header>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function RootRedirect() {
  return <Navigate to={ROUTES.dashboard} replace />;
}

export function ForbiddenScreen() {
  return (
    <section>
      <h1>403 — 権限がありません</h1>
      <p className="muted">この操作には admin ロールが必要です。</p>
    </section>
  );
}
