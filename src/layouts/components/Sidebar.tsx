import { NavLink } from "react-router-dom";
import { PathIcon } from "../../components";
import { useAuth } from "../../features/auth";
import { NAV_ITEMS } from "../nav";
import { ROUTES } from "../../routes/paths";
import styles from "./Sidebar.module.css";

/**
 * 左サイドバーのナビゲーション。
 *
 * NavLink の active 判定を使うため、/spots は /spots/new・/spots/:id/edit でも
 * 選択状態になる（ダッシュボードのみ end で完全一致）。
 * admin 専用項目は admin 以外には表示しない。
 */
export function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const items = NAV_ITEMS.filter((item) => isAdmin || !item.adminOnly);

  return (
    <nav className={styles.nav} aria-label="メインナビゲーション">
      {items.map((item) => (
        <NavLink
          key={item.key}
          to={item.path}
          end={item.path === ROUTES.dashboard}
          className={({ isActive }) =>
            `${styles.item} ${isActive ? styles.active : ""}`.trim()
          }
        >
          <PathIcon path={item.icon} size={18} className={styles.icon} />
          <span className={styles.label}>{item.label}</span>
          {item.suffix && <span className={styles.suffix}>{item.suffix}</span>}
        </NavLink>
      ))}
    </nav>
  );
}
