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
 * `GET /api/v1/users` の 1 件（Backend `UserListItemResponse`）。
 *
 * ロールは含まない。正が Supabase Auth の `app_metadata.role` で users テーブルに無く、
 * 一覧に載せると 1 件ごとに Admin API 呼び出しが必要になるため Backend が返さない設計
 * （Backend #151）。一覧では表示しない。
 */
export type UserListItem = PublicUser & {
  /** 登録日時（ISO 8601）。 */
  createdAt: string;
};

/** `GET /api/v1/users` のページ情報（Backend `UserListMetaResponse`）。 */
export type UserListMeta = {
  /** 0 始まり。 */
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

/** `GET /api/v1/users` のレスポンス封筒。 */
export type UserListResponse = {
  data: UserListItem[];
  meta: UserListMeta;
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
