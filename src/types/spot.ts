import type { Localized } from "./language";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

/**
 * 観光スポット。
 *
 * Backend `SpotResponse`（`GET/POST /api/v1/tourism/spots`）に対応。
 * 多言語項目（name / description / address / businessHours / category.label）は
 * リクエスト言語で解決済みの単一言語で返る。
 */
export type Spot = {
  id: string;
  name: string;
  genre: string;
  description: string;
  coordinates: Coordinates;
  address: string;
  businessHours: string;
  category: {
    label: string;
  };
  media: {
    imageUrl: string;
  };
  /** 未評価のスポットでは JSON から除外される。 */
  rating?: {
    value: number;
  };
};

/** スポットの言語別項目。 */
export type SpotLocalization = {
  name: string;
  categoryLabel: string;
  description: string;
  businessHours: string;
  address: string;
};

/**
 * `POST /api/v1/tourism/spots` のリクエストボディ。
 *
 * `localizations` は対応言語ちょうど4件が必須（Backend `RegisterSpotRequest`）。
 */
export type RegisterSpotRequest = {
  genre: string;
  coordinates: Coordinates;
  imageUrl: string;
  localizations: Localized<SpotLocalization>;
};
