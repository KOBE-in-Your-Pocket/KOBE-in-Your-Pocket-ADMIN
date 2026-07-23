import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "../../routes/paths";
import { getCrumb } from "../nav";
import styles from "./AppLayout.module.css";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

/** ヘッダー・サイドバー・パンくずを備えたログイン後の共通レイアウト。 */
export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.main}>
          <div className={styles.crumb}>{getCrumb(pathname)}</div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function RootRedirect() {
  return <Navigate to={ROUTES.dashboard} replace />;
}
