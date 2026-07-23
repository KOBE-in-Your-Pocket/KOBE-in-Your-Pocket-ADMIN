/**
 * スポット feature の API シーム。
 *
 * 現状は mock 固定データを同期で返す。実 API 接続（#32 一覧 / #33 追加）時は
 * この関数の中身だけを fetch へ差し替えれば、画面側は変更不要。
 */
import { MOCK_SPOTS } from "./mock-spots";
import type { MockSpot } from "./mock-spots";

export type { Genre, MockSpot } from "./mock-spots";
export { GENRE_LABELS, GENRES, LANGS } from "./mock-spots";

/** スポット一覧を取得する（mock）。 */
export function listSpots(): MockSpot[] {
  return MOCK_SPOTS;
}

/** ID でスポットを1件取得する（mock）。見つからなければ undefined。 */
export function getSpot(id: string): MockSpot | undefined {
  return MOCK_SPOTS.find((s) => s.id === id);
}
