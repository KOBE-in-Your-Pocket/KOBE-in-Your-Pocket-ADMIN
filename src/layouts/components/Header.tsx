import { useNavigate } from "react-router-dom";
import { Badge, BellIcon, Button, LogoutIcon } from "../../components";
import { useAuth } from "../../features/auth";
import { ROUTES } from "../../routes/paths";
import styles from "./Header.module.css";

/** 上部ヘッダー。ブランド・タイトル・ユーザー情報・ログアウト。 */
export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        {/* デザインのロゴ画像は未取得のためワードマークで代替 */}
        <span className={styles.wordmark}>
          <span className={styles.wordmarkMain}>KOBE</span>
          <span className={styles.wordmarkSub}>in Your Pocket</span>
        </span>
      </div>
      <div className={styles.bar}>
        <div className={styles.title}>KOBE in Your Pocket — 管理画面</div>
        <div className={styles.actions}>
          {/* 通知機能は未実装のため装飾のみ */}
          <span className={styles.bell} aria-hidden="true">
            <BellIcon size={20} />
          </span>
          {user !== null && (
            <div className={styles.user}>
              <span className={styles.userName}>{user.name}</span>
              <Badge tone={user.role === "operator" ? "operator" : "primary"}>
                {user.role}
              </Badge>
            </div>
          )}
          <Button variant="secondary" size="sm" onClick={onLogout}>
            <LogoutIcon size={15} />
            ログアウト
          </Button>
        </div>
      </div>
    </header>
  );
}
