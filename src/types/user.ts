import type { Role } from "./role";

/**
 * 公開ユーザー射影。
 *
 * Backend `PublicUserResponse { id, name, iconUrl }` に対応。
 * ロール・クレデンシャルは含まない（ロールは JWT から解決する）。
 */
export type PublicUser = {
  id: string;
  name: string;
  /** 未設定時は null（Backend は NON_NULL 除外をしていないため null が届く）。 */
  iconUrl: string | null;
};

/** 管理画面のユーザー一覧行。ロールは JWT / 管理 API 側から補う。 */
export type User = PublicUser & {
  role: Role;
};

/**
 * `POST /api/v1/auth/{signup,login,refresh}` のレスポンス。
 *
 * Backend `AuthSessionResponse` はすべて nullable。
 */
export type AuthSession = {
  accessToken: string | null;
  refreshToken: string | null;
  /** アクセストークンの有効期間（秒）。 */
  expiresIn: number | null;
  tokenType: string | null;
  user: PublicUser | null;
};

export type SignUpRequest = {
  email: string;
  /** 6〜128 文字（Backend バリデーション）。 */
  password: string;
  /** 最大 100 文字（Backend `PublicUser.MAX_NAME_LENGTH`）。 */
  name: string;
};

export type SignInRequest = {
  email: string;
  password: string;
};

export type RefreshRequest = {
  refreshToken: string;
};
