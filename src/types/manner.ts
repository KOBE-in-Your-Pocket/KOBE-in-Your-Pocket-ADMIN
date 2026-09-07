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
 * 公開 API（`GET /api/v1/manner/items`）は `?lang=` で 1 言語に解決した [MannerItem] を返すが、
 * 編集フォームは対応言語すべてを必要とする。ジャンルマスタと同じく、管理 API では
 * 全言語まとめて返す形を想定している（スポット詳細のように言語ごとへ解決すると、
 * 編集のたびに 4 回取得することになる）。
 */
export type MannerItemDetail = {
  id: string;
  /**
   * 従来のアイコン識別キー（Backend `manner_item.icon` / VARCHAR(64)）。
   *
   * Client はこのキーを同梱のピクトグラムへ対応づけている。[iconUrl] が入るまでの
   * フォールバックとして残す。新規追加では空になる。
   */
  icon: string;
  kind: MannerKind;
  scope: MannerScope;
  /**
   * アップロードしたアイコン画像の URL。未設定なら null。
   *
   * **Backend / Client 双方に追加要求が必要な項目**。現状 `manner_item.icon` は
   * VARCHAR(64) の識別キーで画像 URL を入れられず、Client も同梱アセットしか描画
   * できない（`MANNER_PICTOGRAM_MAP` が require で解決している）。
   *
   * 想定する形: Backend は `icon_url TEXT NULL` を追加してレスポンスに載せる。
   * Client は `iconUrl` があればリモート画像、無ければ従来どおり `icon` のキーで
   * 表示する。既存データを移行せずに済ませるため、置き換えではなく追加にしている。
   */
  iconUrl: string | null;
  /** 関連する `Spot.id`。ID 参照のみで、実在検証はしない（Backend M-2）。 */
  relatedSpotIds: string[];
  localizations: Localized<MannerLocalization>;
};

/**
 * マナー項目の登録・更新で送る内容。
 *
 * `id` は含めない。ジャンルと同じく、Backend が英語タイトルの slug から採番する想定
 * （管理 API 未実装のため、この点は実装時に要確認）。
 */
export type MannerItemInput = Omit<MannerItemDetail, "id">;
