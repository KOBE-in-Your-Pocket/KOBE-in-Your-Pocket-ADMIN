/**
 * ユーザー feature の API シーム。
 *
 * 現状は mock 固定データを同期で返す。実 API 接続（#34 一覧 / #35 削除）時は
 * この関数の中身だけを fetch へ差し替えれば、画面側は変更不要。
 */
import { MOCK_USERS } from "./mock-users";
import type { MockUser } from "./mock-users";

export type { MockUser } from "./mock-users";

/** ユーザー一覧を取得する（mock）。 */
export function listUsers(): MockUser[] {
  return MOCK_USERS;
}
