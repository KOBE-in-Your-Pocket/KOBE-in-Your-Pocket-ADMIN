import type { Localized } from "./language";

/**
 * ジャンルマスタの 1 件（Backend `GenreResponse` / #153）。
 *
 * スポットの絞り込み区分。`spot.genre` がこの `code` を外部キーで参照する。表示名は
 * マスタが対応言語ぶん持ち、ADMIN の一覧・Client のジャンルフィルタが同じ値を使う。
 */
export type Genre = {
  /**
   * スポットの `genre` と突き合わせる識別子。
   *
   * **Backend が英語表示名の slug から採番する**（`GenreCode.fromLabel`）。ADMIN からは
   * 送らない。作成後は変更されない（変えると既存スポットの参照先が消えるため）。
   */
  code: string;
  /**
   * Client のジャンルフィルタの並び順。小さいほど前。
   *
   * ADMIN に並べ替え UI は無いが、更新で送らないと Backend 側で 0 に戻るため、
   * 取得した値をそのまま持ち回る。
   */
  displayOrder: number;
  /** 表示名。対応言語すべてを持つ。 */
  labels: Localized<string>;
  /**
   * このジャンルを参照しているスポットの件数。
   *
   * **一覧のみで、登録・更新の応答では null**（Backend が集計しない）。使用中のジャンルは
   * 削除できないため、運営が付け替えの要否を判断する材料になる。
   */
  spotCount: number | null;
};

/**
 * ジャンルの登録・更新で送る内容（Backend `GenreRequest`）。
 *
 * `code` は含まない。登録時は Backend が `labels.en` の slug から採番し、更新時はパスの
 * 値がそのまま使われる。
 */
export type GenreInput = {
  displayOrder: number;
  labels: Localized<string>;
};
