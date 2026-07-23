/**
 * ダッシュボードの mock データ。
 *
 * 統計 API（GET /stats 相当）は未整備のため固定値。実 API 化時に差し替える。
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

export const MOCK_RECENT_ACTIONS: RecentAction[] = [
  { at: "2024/05/20 14:35", who: "山田 太郎", what: "スポットを編集" },
  { at: "2024/05/20 11:12", who: "佐藤 花子", what: "レビューを削除" },
  { at: "2024/05/20 11:03", who: "山田 太郎", what: "マナーを追加" },
  { at: "2024/05/19 17:45", who: "鈴木 一郎", what: "避難所を編集" },
  { at: "2024/05/19 09:20", who: "山田 太郎", what: "ユーザーを編集" },
];
