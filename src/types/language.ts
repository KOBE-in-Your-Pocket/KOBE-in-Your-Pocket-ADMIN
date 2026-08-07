/**
 * 対応言語キー。
 *
 * Backend `domain/common/localization/Language`（ja / en / ko / zh）と一致させる。
 * API では `?lang=` クエリまたは `Accept-Language` ヘッダで指定する。
 */
export const LANG_KEYS = ["ja", "en", "ko", "zh"] as const;

export type LangKey = (typeof LANG_KEYS)[number];

/** 無指定・未対応時のフォールバック先（Backend `Language.DEFAULT`）。 */
export const FALLBACK_LANG: LangKey = "en";

export function isLangKey(value: string | null | undefined): value is LangKey {
  return LANG_KEYS.includes(value as LangKey);
}

/** 対応言語すべてを値に持つレコード（スポットの多言語入力など）。 */
export type Localized<T> = Record<LangKey, T>;
