import type { Localized } from "./language";

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

/** 言語ごとの文言。 */
export type MannerLocalization = {
  title: string;
  description: string;
};

/**
 * ADMIN が編集するマナー項目（全言語ぶん）。
 *
 * `GET /api/v1/manner/items` は `?lang=` で解決した文言（[MannerItem] 相当）と全言語の
 * `localizations` を同時に返す。編集フォームは対応言語すべてを必要とするため、ADMIN は
 * 後者だけを使う（スポット詳細のように言語ごとへ解決すると、編集のたびに 4 回取得することになる）。
 */
export type MannerItemDetail = {
  id: string;
  /**
   * 従来のアイコン識別キー（Backend `manner_item.icon` / VARCHAR(64)）。
   *
   * Client はこのキーを同梱のピクトグラムへ対応づけている。[iconUrl] が無い項目の
   * フォールバックとして残す。新規追加では空になる（Backend では null）。
   */
  icon: string;
  kind: MannerKind;
  scope: MannerScope;
  /**
   * アップロードしたアイコン画像の URL（Backend `manner_item.icon_url` / V16）。未設定なら null。
   *
   * Client は `iconUrl` があればリモート画像で描き、無ければ従来どおり [icon] のキーで
   * 同梱アセットへ解決する。既存データを移行せずに済ませるため、[icon] の置き換えではなく
   * 追加になっている。
   */
  iconUrl: string | null;
  /** 関連する `Spot.id`。ID 参照のみで、実在検証はしない（Backend M-2）。 */
  relatedSpotIds: string[];
  localizations: Localized<MannerLocalization>;
};

/**
 * マナー項目の登録・更新で送る内容。
 *
 * `id` は含めない。ジャンルと同じく、Backend が英語タイトルの slug から採番し
 * （`MannerItem.Id.fromTitle`）、更新時はパスの値をそのまま使う。
 */
export type MannerItemInput = Omit<MannerItemDetail, "id">;
