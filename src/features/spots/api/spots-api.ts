/**
 * スポット feature の API。
 *
 * 一覧は実 API（GET /api/v1/tourism/spots）に接続済み（#32）。
 * 追加（#33）/ 編集は未接続で、フォームは getSpot の mock を使う。
 */
import { apiRequest } from "../../../api";
import type { Spot } from "../../../types";
import { MOCK_SPOTS } from "./mock-spots";
import type { MockSpot } from "./mock-spots";

export type { Genre, MockSpot } from "./mock-spots";
export { GENRE_LABELS, GENRES, LANGS } from "./mock-spots";

/** 管理画面の表示言語。多言語項目はこの言語で解決された単一言語で返る。 */
const LIST_LANG = "ja";

/**
 * スポット一覧を取得する（GET /api/v1/tourism/spots）。
 *
 * Backend はページング・フィルタ無しで全件を配列で返す。絞り込み・ページングは
 * 画面側（クライアント）で行う。
 */
export function fetchSpots(): Promise<Spot[]> {
  return apiRequest<Spot[]>(`/api/v1/tourism/spots?lang=${LIST_LANG}`);
}

/** ID でスポットを1件取得する（mock。編集フォーム用、実 API 接続は別 Issue）。 */
export function getSpot(id: string): MockSpot | undefined {
  return MOCK_SPOTS.find((s) => s.id === id);
}
