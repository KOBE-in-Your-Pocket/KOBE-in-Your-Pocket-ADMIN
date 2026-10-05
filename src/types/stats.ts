import type { LangKey } from "./language";

/**
 * `GET /api/v1/stats` のレスポンス（Backend `DashboardStatsResponse` / Backend #169）。
 *
 * ダッシュボードが必要とする値を 1 リクエストで返す運営専用 API。集計は Backend の
 * COUNT / GROUP BY で行うため、一覧 API の 200 件上限（`MAX_SIZE`）の影響を受けない。
 */
export type DashboardStats = {
  /** 全期間の総数。 */
  totals: EntityCounts;
  /** ユーザーの登録件数（今月・先月）。 */
  newUsers: PeriodCount;
  /** スポットの登録件数（今月・先月）。 */
  newSpots: PeriodCount;
  /** レビューの投稿件数（今月・先月）。 */
  newReviews: PeriodCount;
  /** レビュー数の多い順。同数のときは spotId 順で安定する。 */
  popularSpots: PopularSpot[];
  /** 投稿の新しい順。 */
  recentReviews: RecentReview[];
};

export type EntityCounts = {
  users: number;
  spots: number;
  reviews: number;
};

/**
 * 期間ごとの登録件数。
 *
 * Backend は増減率ではなく生の件数を返す（先月 0 件のときの見せ方を画面側で決められるように）。
 * 月の境界は Asia/Tokyo の月初。
 */
export type PeriodCount = {
  thisMonth: number;
  lastMonth: number;
};

/** 人気スポット 1 件。`name` は要求言語で解決済み。 */
export type PopularSpot = {
  spotId: string;
  name: string;
  reviewCount: number;
};

/**
 * 直近のレビュー 1 件。
 *
 * コメント本文は含まない（ダッシュボードは「いつ・誰が・どのスポットに」まで）。
 * `spotName` だけ要求言語で解決され、`authorName` は投稿時の言語のまま。
 */
export type RecentReview = {
  id: string;
  spotId: string;
  spotName: string;
  authorName: string;
  rating: { value: number };
  /** ISO 8601 の日時文字列。 */
  postedAt: string;
  language: LangKey;
};
