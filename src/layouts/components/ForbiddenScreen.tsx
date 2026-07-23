import { useNavigate } from "react-router-dom";
import { Button, LockIcon } from "../../components";
import { ROUTES } from "../../routes/paths";
import styles from "./ForbiddenScreen.module.css";

/** admin 専用ページに権限のないユーザーがアクセスしたときの 403 表示。 */
export function ForbiddenScreen() {
  const navigate = useNavigate();

  return (
    <div className={styles.panel} role="alert">
      <div className={styles.iconCircle}>
        <LockIcon size={30} />
      </div>
      <div className={styles.code}>403</div>
      <h1 className={styles.title}>アクセス権限がありません</h1>
      <p className={styles.note}>このページにアクセスする権限がありません。</p>
      <div className={styles.action}>
        <Button onClick={() => navigate(ROUTES.dashboard)}>
          ダッシュボードに戻る
        </Button>
      </div>
    </div>
  );
}
