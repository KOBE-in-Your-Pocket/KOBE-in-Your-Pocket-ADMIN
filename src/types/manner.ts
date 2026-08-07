/** マナー項目の種別（Backend `MannerItemResponse.kind` のリテラル）。 */
export const MANNER_KINDS = ["manner", "rule"] as const;

export type MannerKind = (typeof MANNER_KINDS)[number];

/** マナー項目の適用範囲（Backend `MannerItemResponse.scope` のリテラル）。 */
export const MANNER_SCOPES = ["local", "japan"] as const;

export type MannerScope = (typeof MANNER_SCOPES)[number];

/**
 * マナー項目。
 *
 * Backend `MannerItemResponse`（`GET /api/v1/manner/items`）に対応。
 * `icon` はアイコン識別キー、`relatedSpotIds` は `Spot.id` への ID 参照のみ。
 */
export type MannerItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  kind: MannerKind;
  scope: MannerScope;
  relatedSpotIds: string[];
};
