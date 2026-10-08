/**
 * 口コミへの通報（運営向け）。
 *
 * Backend `ReviewReportListResponse`（`GET /api/v1/reports/reviews`・Backend #145）に対応。
 * 一覧は **通報 1 件ごとではなく、通報された口コミごと** にまとめた形で返る。
 */

/**
 * 通報の対応状況。`OPEN` から `APPROVED`（承認済み）/ `REJECTED`（拒否済み）へ一度だけ進む（戻す操作は無い）。
 *
 * 承認した口コミは削除されず、管理画面には残る。アプリ側は `hiddenByReport` を見て非表示にする（Backend #202）。
 */
export type ReportStatus = "OPEN" | "APPROVED" | "REJECTED";

/** 運営が口コミ単位で付けられる対応結果。 */
export type ReportDecision = Exclude<ReportStatus, "OPEN">;

/** 通報理由（Backend `ReportReason`）。`OTHER` のときだけ自由記述が必須。 */
export type ReportReason =
  | "SPAM"
  | "HARASSMENT"
  | "HATE"
  | "SEXUAL_OR_VIOLENT"
  | "PERSONAL_INFO"
  | "MISLEADING"
  | "OTHER";

/** 投稿者・通報者。`id` は投稿者不明の古い口コミで、`name` はプロフィール行が無いとき null。 */
export type ReportPerson = {
  id: string | null;
  name: string | null;
};

/**
 * 通報された口コミの本文。
 *
 * `spotName` は要求言語で解決済み。`comment` / `author.name` は投稿時の言語のまま（`language`）。
 */
export type ReportedReview = {
  spotId: string;
  spotName: string;
  /** 1〜5 の整数。 */
  rating: number;
  comment: string;
  author: ReportPerson;
  language: string;
  /** ISO 8601。 */
  postedAt: string;
};

/** 通報 1 件。 */
export type ReviewReportItem = {
  id: string;
  /** 未知の理由が増えても落ちないよう string で受ける。 */
  reason: ReportReason | (string & {});
  description: string | null;
  status: ReportStatus;
  reporter: ReportPerson;
  /** ISO 8601。 */
  createdAt: string;
  /** 対応した運営のユーザー ID。未対応なら null。 */
  handledBy: string | null;
  handledAt: string | null;
};

/** 通報された口コミ 1 件分（その口コミへの通報をまとめたもの）。 */
export type ReviewReportGroup = {
  reviewId: string;
  /** 口コミが削除済み（投稿者の削除・退会、運営の削除）なら null。承認しただけでは null にならない。 */
  review: ReportedReview | null;
  reportCount: number;
  /** 未対応（OPEN）の通報件数。 */
  openCount: number;
  /** 理由ごとの件数。 */
  reasonCounts: Record<string, number>;
  latestReportedAt: string;
  reports: ReviewReportItem[];
};

export type ReviewReportListMeta = {
  /** 0 始まり。 */
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

/** `GET /api/v1/reports/reviews` のレスポンス封筒。 */
export type ReviewReportListResponse = {
  data: ReviewReportGroup[];
  meta: ReviewReportListMeta;
};
