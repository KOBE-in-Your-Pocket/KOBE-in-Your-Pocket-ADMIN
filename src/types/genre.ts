import type { Localized } from "./language";

/**
 * ジャンルマスタの 1 件。
 *
 * `code` はスポットの `genre` に入る識別子（例: `onsen`）。Backend の `spot.genre` は
 * VARCHAR で、マスタテーブルはまだ無い（Backend #153）。表示名も保存されておらず、
 * ADMIN は `GENRE_LABELS`、Client は i18n にそれぞれハードコードしている状態のため、
 * 運営がジャンルを追加してもどちらにもラベルが出ない。
 *
 * その解決として、マスタ側で対応言語ぶんの表示名を持つ形にする。
 */
export type Genre = {
  /**
   * スポットの `genre` と突き合わせる識別子。
   *
   * **Backend が英語表示名の slug から採番する**（Backend #153）。ADMIN からは
   * 送らない。作成後は変更されない。
   */
  code: string;
  /** 表示名。対応言語すべてを持つ。 */
  labels: Localized<string>;
};

/**
 * ジャンルの登録・更新で送る内容。
 *
 * `code` は含めない。Backend が `labels.en` の slug から決めるため、ADMIN が送っても
 * 無視される（送ると「入力したコードが採用される」と誤解させる）。
 */
export type GenreInput = {
  labels: Localized<string>;
};
