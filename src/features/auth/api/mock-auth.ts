import type { AuthUser } from "../AuthProvider";
import { ROUTES } from "../../../routes/paths";

type MockAccount = AuthUser & { email: string; password: string };

/**
 * mock 認証用のアカウント。
 *
 * Backend の認証 API が未接続のため、メールアドレス+パスワードで判定する。
 * 実 API 化は #30、api クライアント連携は #27 で `auth-api` 側へ差し替える。
 */
export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: "1",
    email: "admin@example.com",
    password: "password123",
    name: "山田 太郎",
    role: "admin",
  },
  {
    id: "2",
    email: "operator@example.com",
    password: "password123",
    name: "鈴木 花子",
    role: "operator",
  },
];

/** 認証する。該当アカウントが無ければ null。 */
export function authenticate(email: string, password: string): AuthUser | null {
  const account = MOCK_ACCOUNTS.find(
    (a) => a.email === email.trim().toLowerCase() && a.password === password,
  );
  if (!account) return null;
  return { id: account.id, name: account.name, role: account.role };
}

/** ロールごとのログイン後の遷移先。admin はダッシュボード、それ以外はスポット。 */
export function landingPath(role: AuthUser["role"]): string {
  return role === "admin" ? ROUTES.dashboard : ROUTES.spots;
}
