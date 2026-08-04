import type { LangKey } from "../../../types";

/**
 * スポット管理の表示用定数。
 *
 * 一覧・追加・編集はすべて実 API に接続済みのため、mock 固定データは持たない。
 * ジャンルは Backend の `Genre`（landmark / nature / history / gourmet / onsen）に対応する。
 */

export type Genre = "landmark" | "nature" | "history" | "gourmet" | "onsen";

/** ジャンルの日本語表示。 */
export const GENRE_LABELS: Record<Genre, string> = {
  landmark: "名所",
  nature: "自然",
  history: "歴史",
  gourmet: "グルメ",
  onsen: "温泉",
};

export const GENRES = Object.keys(GENRE_LABELS) as Genre[];

/** 言語タブのラベル。 */
export const LANGS: { key: LangKey; label: string }[] = [
  { key: "ja", label: "日本語" },
  { key: "en", label: "English" },
  { key: "zh", label: "中文" },
  { key: "ko", label: "한국어" },
];
