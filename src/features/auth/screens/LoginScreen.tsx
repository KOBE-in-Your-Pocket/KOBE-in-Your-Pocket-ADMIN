import { useId, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, EyeIcon, EyeOffIcon } from "../../../components";
import { useAuth } from "../AuthProvider";
import { authenticate, landingPath } from "../mock-auth";
import styles from "./LoginScreen.module.css";

/**
 * ログイン画面（mock）。ADMIN-image pages/login 準拠。
 *
 * 認証は mock-auth.authenticate で行う。実 API 化は #30、
 * api クライアント連携は #27、JWT 保存は #28 で差し替える。
 */
export function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // API 未接続のため、デモ用の初期値を入れている。
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const emailId = useId();
  const passwordId = useId();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const user = authenticate(email, password);
    if (!user) {
      setError(true);
      return;
    }
    setError(false);
    login(user);
    navigate(landingPath(user.role), { replace: true });
  };

  return (
    <div className={styles.page}>
      <div className={styles.brandPanel}>
        {/* ロゴ画像は未取得のためワードマークで代替 */}
        <div className={styles.brandName}>KOBE</div>
        <div className={styles.brandTagline}>in Your Pocket</div>
      </div>

      <div className={styles.formPanel}>
        <form className={styles.form} onSubmit={onSubmit}>
          <h1 className={styles.heading}>ログイン</h1>

          <label className={styles.label} htmlFor={emailId}>
            メールアドレス
          </label>
          <input
            id={emailId}
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            autoComplete="username"
          />

          <label className={styles.label} htmlFor={passwordId}>
            パスワード
          </label>
          <div className={styles.passwordField}>
            <input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              className={styles.passwordInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>

          <label className={styles.remember}>
            <input type="checkbox" className={styles.checkbox} />
            ログイン状態を保持する
          </label>

          <div className={styles.forgot}>
            <a href="#">パスワードをお忘れですか？</a>
          </div>

          <Button type="submit" fullWidth>
            ログイン
          </Button>

          {error && (
            <div className={styles.error} role="alert">
              メールアドレスまたはパスワードが正しくありません。
            </div>
          )}

          <div className={styles.hint}>
            <strong>デモアカウント（mock）</strong>
            <br />
            admin: <code>admin@example.com</code> / operator:{" "}
            <code>operator@example.com</code>
            <br />
            パスワードはどちらも <code>password123</code>
          </div>
        </form>
      </div>
    </div>
  );
}
