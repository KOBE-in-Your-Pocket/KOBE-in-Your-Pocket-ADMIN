/**
 * ダッシュボードの mock 固定データ。
 *
 * 画面は直接 import せず、`dashboard-api` の getter 経由で参照する。
 * 統計・操作ログ API（GET /stats 相当）は未整備のため固定値。実 API 化時に差し替える。
 */

export type StatKey = "users" | "spots" | "reviews" | "new-users";

export type Stat = {
  key: StatKey;
  label: string;
  value: string;
  delta: string;
};

export const MOCK_STATS: Stat[] = [
  { key: "users", label: "総ユーザー数", value: "12,345", delta: "+12.5%" },
  { key: "spots", label: "総スポット数", value: "1,234", delta: "+8.2%" },
  { key: "reviews", label: "総レビュー数", value: "5,678", delta: "+15.3%" },
  { key: "new-users", label: "今月の新規ユーザー", value: "789", delta: "+9.1%" },
];

export type PopularSpot = {
  rank: number;
  name: string;
  count: string;
  /** 順位バッジの色（金・銀・銅・以降グレー）。 */
  color: string;
};

export const MOCK_POPULAR_SPOTS: PopularSpot[] = [
  { rank: 1, name: "神戸ポートタワー", count: "1,256", color: "#F39C12" },
  { rank: 2, name: "北野異人館街", count: "982", color: "#94A3B8" },
  { rank: 3, name: "メリケンパーク", count: "873", color: "#B45309" },
  { rank: 4, name: "六甲山", count: "654", color: "#CBD5E1" },
  { rank: 5, name: "有馬温泉", count: "521", color: "#CBD5E1" },
];

export type RecentAction = {
  at: string;
  who: string;
  what: string;
};

/** YYYY/MM/DD HH:mm 形式に整形する。 */
function formatAt(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 現在時刻から minutesAgo 分前の日時文字列。 */
function minutesAgo(minutes: number): string {
  return formatAt(new Date(Date.now() - minutes * 60_000));
}

/**
 * 「直近5件」が常に現在時刻基準になるよう、固定日時ではなく相対で生成する。
 * 統計・操作ログ API 未整備のための mock（実 API 化時に差し替え）。
 */
export const MOCK_RECENT_ACTIONS: RecentAction[] = [
  { at: minutesAgo(12), who: "山田 太郎", what: "スポットを編集" },
  { at: minutesAgo(95), who: "佐藤 花子", what: "レビューを削除" },
  { at: minutesAgo(60 * 5), who: "山田 太郎", what: "マナーを追加" },
  { at: minutesAgo(60 * 26), who: "鈴木 一郎", what: "避難所を編集" },
  { at: minutesAgo(60 * 32), who: "山田 太郎", what: "ユーザーを編集" },
];
