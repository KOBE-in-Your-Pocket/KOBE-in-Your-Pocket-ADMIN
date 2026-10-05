/**
 * ユーザー feature の API。
 *
 * 一覧（#34）・削除（#35）とも実 API に接続済み。
 */
import { apiRequest } from "../../../api";
import type { UserListItem, UserListResponse } from "../../../types";

const USERS_PATH = "/api/v1/users";

/**
 * 削除は認証プロキシ側の namespace にある（Backend の既存 API）。
 * 一覧の `/api/v1/users` とパスが揃っていないのは Backend の都合で、統一は Backend #151 で別途。
 */
const DELETE_USER_PATH = "/api/v1/auth/users";

/**
 * 1 リクエストで取得する上限。Backend の `ListUsersService.MAX_SIZE` と同値。
 *
 * これを超える指定は Backend 側で丸められるため、ここで超えても無駄になる。
 */
const MAX_PAGE_SIZE = 200;

/**
 * ユーザー一覧を取得する（GET /api/v1/users）。
 *
 * Backend はページングに対応しているが、**検索 API が無い**ため画面側で名前フィルタを
 * 掛けている。サーバーページングにすると「表示中のページ内だけ検索」になってしまうので、
 * 上限まで一括取得して絞り込み・ページングを画面側で行う（スポット一覧と同じ方針）。
 *
 * 総数が [MAX_PAGE_SIZE] を超えると 2 ページ目以降が画面に出ない。件数が増えたら
 * サーバー検索 + サーバーページングへ切り替える必要がある（`meta.totalElements` で検知できる）。
 */
export async function fetchUsers(): Promise<UserListResponse> {
  return apiRequest<UserListResponse>(`${USERS_PATH}?size=${MAX_PAGE_SIZE}`);
}

/**
 * ユーザーを削除する（DELETE /api/v1/auth/users/{id}）。
 *
 * Backend は **admin ロール専用**。成功時は 204（ボディ無し）。
 * Supabase Auth のユーザーと DB のプロフィール行の両方が消える。
 */
export function deleteUser(id: string): Promise<void> {
  return apiRequest<void>(
    `${DELETE_USER_PATH}/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

export type { UserListItem };
