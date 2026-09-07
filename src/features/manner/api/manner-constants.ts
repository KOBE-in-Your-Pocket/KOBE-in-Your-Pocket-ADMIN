/**
 * マナー feature の表示用定数。
 *
 * kind / scope は Backend の CHECK 制約（V5）と Client のリテラルで閉じた集合。
 * ADMIN は選択肢として出し、自由入力にしない。
 */
import type { MannerKind, MannerScope } from "../../../types";

/** 種別の表示名。Client のフィルタ表示（ルール / マナー）と同じ語にそろえる。 */
export const KIND_LABELS: Record<MannerKind, string> = {
  manner: "マナー",
  rule: "ルール",
};

/** 適用範囲の表示名。Client の表示は「各所」「全国」。 */
export const SCOPE_LABELS: Record<MannerScope, string> = {
  local: "各所（神戸）",
  japan: "全国",
};

/**
 * 従来のアイコン識別キーと、その表示名。
 *
 * アイコンは画像アップロードに変えたため、**これは選択肢ではなく既存データの読み替え表**。
 * 画像が未設定の項目は Client がこのキーで同梱ピクトグラムを引く（`manner-icon.tsx` の
 * `ICON_MAP`）ので、一覧・フォームで「アプリでは何が出るのか」を示すために使う。
 *
 * ここに無いキーは Client が汎用の info アイコンにフォールバックする。
 */
export const MANNER_ICONS: { key: string; label: string }[] = [
  { key: "no-eating-while-walking", label: "食べ歩き禁止" },
  { key: "put-trash-in-bin", label: "ゴミはゴミ箱へ" },
  { key: "no-trespassing", label: "立入禁止" },
  { key: "handle-products-with-care", label: "商品は丁寧に扱う" },
  { key: "do-not-obstruct-pedestrians", label: "通行の妨げ禁止" },
  { key: "no-smoking-while-walking", label: "歩きたばこ禁止" },
  { key: "hold-your-suitcase", label: "荷物は手元に" },
  { key: "backpack-on-front", label: "リュックは前に" },
  { key: "show-consideration", label: "思いやり" },
  { key: "no-loud-conversation", label: "大声での会話を控える" },
  { key: "no-phone-calls", label: "通話を控える" },
  { key: "no-white-clothes-in-kinsen", label: "銀泉では白い服を避ける" },
  { key: "no-feeding-wild-boars", label: "イノシシに餌をやらない" },
];

/** Client がピクトグラムを持っているキーか。 */
export function isKnownIcon(icon: string): boolean {
  return MANNER_ICONS.some((option) => option.key === icon);
}

/** アイコンキーの表示名。Client に無いキーはキーのまま返す。 */
export function iconLabel(icon: string): string {
  return MANNER_ICONS.find((option) => option.key === icon)?.label ?? icon;
}
