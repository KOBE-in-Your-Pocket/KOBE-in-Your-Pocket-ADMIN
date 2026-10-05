import { type LangKey, isLangKey } from "../types";

/**
 * 言語コードの表示ラベル。
 *
 * Backend が返すのはコード（`ja` / `en` / `zh` / `ko`）なので、一覧に出すときに引き当てる。
 *
 * 注意: `features/spots/api/spot-constants.ts` の `LANGS` が同じ対応表を持っている。
 * あちらは言語タブの並び順も兼ねているため統合していないが、増やすなら両方を更新すること。
 */
export const LANG_LABELS: Record<LangKey, string> = {
  ja: "日本語",
  en: "English",
  zh: "中文",
  ko: "한국어",
};

/**
 * 言語コードを表示ラベルにする。
 *
 * 未対応のコードはそのまま返す。空欄にするより、届いた値が見えた方が原因を追いやすい
 * （Backend が対応言語を増やしたのに ADMIN が追随していない、等）。
 */
export function languageLabel(code: string): string {
  return isLangKey(code) ? LANG_LABELS[code] : code;
}
