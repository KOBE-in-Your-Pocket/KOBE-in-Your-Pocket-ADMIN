/**
 * レビュー管理の mock 固定データ。
 *
 * 画面は直接 import せず、`reviews-api` の `listReviews()` 経由で参照する。
 * 実 API 接続時はこのモジュールを差し替える（一覧 GET は Backend 有・接続は未 Issue、
 * 削除 DELETE は Backend #86）。
 */
export type MockReview = {
  id: string;
  spot: string;
  /** 0〜5。端数（4.5 等）あり。 */
  rating: number;
  comment: string;
  author: string;
  /** 表示用の言語ラベル。 */
  lang: string;
  date: string;
};

export const RATINGS = [5, 4, 3, 2, 1];

export const MOCK_REVIEWS: MockReview[] = [
  { id: "1", spot: "神戸ポートタワー", rating: 4.5, comment: "素晴らしい景色でした！", author: "John D.", lang: "English", date: "2024/05/20" },
  { id: "2", spot: "神戸ポートタワー", rating: 4, comment: "夜景がとても綺麗です。", author: "Emily S.", lang: "中文", date: "2024/05/19" },
  { id: "3", spot: "北野異人館街", rating: 5, comment: "異国情緒があって最高でした。", author: "田中 太郎", lang: "日本語", date: "2024/05/18" },
  { id: "4", spot: "有馬温泉", rating: 3.5, comment: "お湯は良かったが混んでいた。", author: "Kim M.", lang: "한국어", date: "2024/05/17" },
  { id: "5", spot: "六甲山", rating: 5, comment: "ハイキングに最適。眺めが最高。", author: "佐藤 花子", lang: "日本語", date: "2024/05/16" },
  { id: "6", spot: "南京町（中華街）", rating: 4, comment: "食べ歩きが楽しかった。", author: "Wang L.", lang: "中文", date: "2024/05/15" },
  { id: "7", spot: "メリケンパーク", rating: 2, comment: "思ったより狭かった。", author: "Chris P.", lang: "English", date: "2024/05/14" },
  { id: "8", spot: "神戸牛ステーキ", rating: 5, comment: "人生で一番美味しい肉でした。", author: "鈴木 一郎", lang: "日本語", date: "2024/05/13" },
  { id: "9", spot: "有馬温泉", rating: 4, comment: "金の湯が特に良かった。", author: "Olivia B.", lang: "English", date: "2024/05/12" },
  { id: "10", spot: "北野異人館街", rating: 3, comment: "坂道が多くて疲れた。", author: "李 美花", lang: "中文", date: "2024/05/11" },
  { id: "11", spot: "須磨海岸", rating: 4.5, comment: "夏に来ると気持ちいい。", author: "山田 健", lang: "日本語", date: "2024/05/10" },
  { id: "12", spot: "生田神社", rating: 3, comment: "こぢんまりしていた。", author: "Park J.", lang: "한국어", date: "2024/05/09" },
];
