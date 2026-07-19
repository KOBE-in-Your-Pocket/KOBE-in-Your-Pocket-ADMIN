import { Link } from "react-router-dom";
import { ROUTES } from "../../../routes/paths";

export function LoginScreen() {
  return (
    <main className="auth-screen">
      <h1>KOBE in Your Pocket</h1>
      <p className="muted">管理画面 — ログイン（実装予定）</p>
      <p>
        <Link to={ROUTES.dashboard}>ダッシュボードへ（開発用）</Link>
      </p>
    </main>
  );
}
