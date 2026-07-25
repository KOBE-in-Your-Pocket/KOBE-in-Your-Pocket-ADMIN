import { useId, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { isApiError, isNetworkError } from "../../../api";
import logoUrl from "../../../assets/logo/kobe-in-your-pocket.png";
import { Button, EyeIcon, EyeOffIcon } from "../../../components";
import { isAdminConsoleRole } from "../../../types";
import { login as loginRequest } from "../api/auth-api";
import { useAuth } from "../AuthProvider";
import { landingPath } from "../landing";
import styles from "./LoginScreen.module.css";

/**
 * ログイン画面。Backend `/api/v1/auth/login` で認証する。
 *
 * 成功時は establishSession がトークンを保存しロールを JWT から解決する。
 * 管理画面は operator/admin のみ利用可能で、general は権限エラーにする。
 */
export function LoginScreen() {
  const navigate = useNavigate();
  const { establishSession, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailId = useId();
  const passwordId = useId();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const session = await loginRequest({ email, password });
      const user = establishSession(session);
      if (user === null) {
        setError("ログインに失敗しました。もう一度お試しください。");
        return;
      }
      if (!isAdminConsoleRole(user.role)) {
        // 一般ユーザーは管理画面を利用できない。確立したセッションは破棄する。
        logout();
        setError("この画面を利用する権限がありません。");
        return;
      }
      navigate(landingPath(user.role), { replace: true });
    } catch (err) {
      setError(loginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.brandPanel}>
        <img
          className={styles.brandLogo}
          src={logoUrl}
          alt="KOBE in Your Pocket"
        />
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
            disabled={loading}
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
              disabled={loading}
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

          <Button type="submit" fullWidth loading={loading}>
            ログイン
          </Button>

          {error !== null && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

/** ログイン失敗の例外をユーザー向け文言に変換する。 */
function loginErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    // 401 は Spring Security の既定応答で本文が空になるため、認証失敗の定型文にする。
    if (error.isUnauthorized) {
      return "メールアドレスまたはパスワードが正しくありません。";
    }
    return error.message;
  }
  if (isNetworkError(error)) {
    return error.message;
  }
  return "ログインに失敗しました。時間をおいて再度お試しください。";
}
