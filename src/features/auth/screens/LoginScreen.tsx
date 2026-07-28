import { useId, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
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
      // ガードで弾かれた元の画面があればそこへ戻す。無ければロール既定の初期画面。
      const from = safeInternalPath(location.state);
      navigate(from ?? landingPath(user.role), { replace: true });
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
            required
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
              required
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

/**
 * ガードが載せた遷移元（location.state.from）を安全な内部パスとして取り出す。
 *
 * 内部パス（先頭 "/"）のみ許可する。"//"（プロトコル相対）と "/\\"（ブラウザが
 * "//" に正規化しうる）を除外し、外部 URL への誘導（オープンリダイレクト）を防ぐ。
 * 該当しなければ null。
 */
function safeInternalPath(state: unknown): string | null {
  if (typeof state !== "object" || state === null || !("from" in state)) {
    return null;
  }
  const from = (state as { from?: unknown }).from;
  if (
    typeof from === "string" &&
    from.startsWith("/") &&
    !from.startsWith("//") &&
    !from.startsWith("/\\")
  ) {
    return from;
  }
  return null;
}

/** ログイン失敗の例外をユーザー向け文言に変換する（Backend の生メッセージは出さない）。 */
function loginErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    // 入力バリデーション（空・形式不正）。
    if (error.violations.length > 0) {
      return "メールアドレスとパスワードを正しく入力してください。";
    }
    // 認証失敗。GoTrue は資格情報不一致を 400(invalid_grant)、Spring は未認証を 401 で
    // 返すため、どちらも同じ定型文にする（生の error/コードは露出させない）。
    if (error.status === 400 || error.status === 401) {
      return "メールアドレスまたはパスワードが正しくありません。";
    }
    // 5xx / 502 など。
    return "ログインに失敗しました。時間をおいて再度お試しください。";
  }
  if (isNetworkError(error)) {
    return error.message;
  }
  return "ログインに失敗しました。時間をおいて再度お試しください。";
}
