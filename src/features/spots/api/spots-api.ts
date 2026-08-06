/**
 * スポット feature の API。
 *
 * 一覧（#32）・追加（#33）・編集（#87）とも実 API に接続済み。
 */
import { apiRequest } from "../../../api";
import {
  LANG_KEYS,
  type Coordinates,
  type LangKey,
  type Localized,
  type RegisterSpotRequest,
  type Spot,
  type SpotLocalization,
} from "../../../types";

export type { Genre } from "./spot-constants";
export { GENRE_LABELS, GENRES, LANGS } from "./spot-constants";

/** 管理画面の表示言語。多言語項目はこの言語で解決された単一言語で返る。 */
const LIST_LANG = "ja";

const SPOTS_PATH = "/api/v1/tourism/spots";

/**
 * スポット一覧を取得する（GET /api/v1/tourism/spots）。
 *
 * Backend はページング・フィルタ無しで全件を配列で返す。絞り込み・ページングは
 * 画面側（クライアント）で行う。
 */
export function fetchSpots(): Promise<Spot[]> {
  return apiRequest<Spot[]>(`${SPOTS_PATH}?lang=${LIST_LANG}`);
}

/**
 * スポットを追加する（POST /api/v1/tourism/spots）。
 *
 * localizations は ja/en/zh/ko ちょうど4件・各項目が非空であることが Backend 必須。
 * 成功時は作成された Spot（201）を返す。
 */
export function createSpot(request: RegisterSpotRequest): Promise<Spot> {
  return apiRequest<Spot>(SPOTS_PATH, {
    method: "POST",
    json: request,
  });
}

/**
 * スポットを更新する（PUT /api/v1/tourism/spots/{id}）。
 *
 * Backend は追加と同じ `RegisterSpotRequest` を受け取る **全置換**（部分更新ではない）。
 * 該当 id が無ければ 404。
 */
export function updateSpot(
  id: string,
  request: RegisterSpotRequest,
): Promise<Spot> {
  return apiRequest<Spot>(`${SPOTS_PATH}/${encodeURIComponent(id)}`, {
    method: "PUT",
    json: request,
  });
}

/** スポットを1件取得する（GET /api/v1/tourism/spots/{id}）。指定言語で解決された単一言語。 */
export function fetchSpot(id: string, lang: LangKey): Promise<Spot> {
  return apiRequest<Spot>(
    `${SPOTS_PATH}/${encodeURIComponent(id)}?lang=${lang}`,
  );
}

/** 編集フォームが必要とする、全言語ぶんのスポット詳細。 */
export type SpotDetail = {
  genre: string;
  coordinates: Coordinates;
  imageUrl: string;
  localizations: Localized<SpotLocalization>;
};

/**
 * 編集フォーム用に全言語ぶんを取得する。
 *
 * Backend の GET は 1 リクエストにつき 1 言語しか返さない一方、更新（PUT）は 4 言語すべてを
 * 要求するため、対応言語ぶんを並行取得して束ねる。
 *
 * 注意: ある言語のデータが Backend に無い場合は en へフォールバックした値が返る。
 * 追加・更新はどちらも 4 言語必須なので通常は起きないが、その状態で保存すると
 * フォールバック値がそのまま書き込まれる。
 */
export async function fetchSpotDetail(id: string): Promise<SpotDetail> {
  const byLang = await Promise.all(LANG_KEYS.map((lang) => fetchSpot(id, lang)));

  const localizations = {} as Localized<SpotLocalization>;
  LANG_KEYS.forEach((lang, index) => {
    const spot = byLang[index];
    localizations[lang] = {
      name: spot.name,
      categoryLabel: spot.category.label,
      description: spot.description,
      businessHours: spot.businessHours,
      address: spot.address,
    };
  });

  // 言語に依存しない項目はどの応答でも同じなので先頭を使う。
  const base = byLang[0];
  return {
    genre: base.genre,
    coordinates: base.coordinates,
    imageUrl: base.media.imageUrl,
    localizations,
  };
}
