import type { ListResponse } from "./api";
import type { Coordinates } from "./spot";

/**
 * 避難所種別（Backend `ShelterResponse.type` のリテラル）。
 *
 * Backend #162 で、災対法の用語をそのまま slug 化した長い形
 * （`designated-emergency-evacuation-site` 等）から、Client `ShelterType` と同値の
 * 短い形へ変更された。意味の対応は次のとおり。
 *
 * - `emergency` … 指定緊急避難場所
 * - `designated` … 指定避難所
 * - `both` … 兼用
 */
export const SHELTER_TYPES = ["emergency", "designated", "both"] as const;

export type ShelterType = (typeof SHELTER_TYPES)[number];

/**
 * 避難所。
 *
 * Backend `ShelterResponse`（`GET /api/v1/evacuation/shelters`）に対応。
 * `facilityCategory` は運営側で拡張されうる開いた集合のため string のまま扱う。
 */
export type EvacuationShelter = {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  type: ShelterType;
  facilityCategory: string;
  media: {
    imageUrl: string;
  };
  /** 未設定時は JSON から除外される。 */
  capacity?: number;
  accessible: boolean;
  /** 未設定時は JSON から除外される。 */
  externalUrl?: string;
};

/** 避難所一覧のメタ情報。`updatedAt` が差分チェックのキー。 */
export type ShelterListMeta = {
  source: string;
  /** データ基準日（ISO 8601 の日付文字列）。 */
  asOf: string;
  /** ISO 8601 の日時文字列。 */
  updatedAt: string;
};

export type ShelterListResponse = ListResponse<
  EvacuationShelter,
  ShelterListMeta
>;
