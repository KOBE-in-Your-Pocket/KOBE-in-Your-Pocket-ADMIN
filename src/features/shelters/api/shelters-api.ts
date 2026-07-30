/**
 * 避難所 feature の API。読み取り専用（Backend は GET のみ・seed データ）。
 */
import { apiRequest } from "../../../api";
import type { ShelterListResponse } from "../../../types";

/** 管理画面の表示言語。多言語項目はこの言語で解決された単一言語で返る。 */
const LIST_LANG = "ja";

/**
 * 避難所一覧を取得する（GET /api/v1/evacuation/shelters）。
 *
 * レスポンスは `data`（一覧）+ `meta`（出典・基準日・最終更新）の封筒形。
 * 絞り込み・ページングは画面側（クライアント）で行う。
 */
export function fetchShelters(): Promise<ShelterListResponse> {
  return apiRequest<ShelterListResponse>(
    `/api/v1/evacuation/shelters?lang=${LIST_LANG}`,
  );
}
