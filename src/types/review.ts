import type { LangKey } from "./language";

/**
 * スポットレビュー。
 *
 * Backend `ReviewResponse`（`/api/v1/tourism/spots/{spotId}/reviews`）に対応。
 */
export type Review = {
  id: string;
  rating: {
    /** 1〜5 の整数。 */
    value: number;
  };
  comment: string;
  author: {
    name: string;
    /** 未設定時は JSON から除外される。 */
    iconUrl?: string;
  };
  /** ISO 8601 の日時文字列（Backend は `Instant`）。 */
  postedAt: string;
  language: LangKey;
};

/**
 * 運営向けレビュー一覧の 1 件（Backend `ReviewSummaryResponse` / `GET /api/v1/tourism/reviews`）。
 *
 * 公開 API（スポット別）の [Review] に、どのスポットへのレビューかを足した形。
 *
 * `spotName` は要求言語で解決済み（en フォールバック）。一方 `comment` / `author.name` は
 * **投稿時の言語のまま**で、`language` がその言語を表す。運営はスポット名を自分の言語で読みつつ、
 * レビュー本文は原文で確認するため Backend が解決しない。
 */
export type ReviewSummary = Review & {
  spotId: string;
  spotName: string;
};

/** `GET /api/v1/tourism/reviews` のページ情報（Backend `ReviewListMetaResponse`）。 */
export type ReviewListMeta = {
  /** 0 始まり。 */
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

/** `GET /api/v1/tourism/reviews` のレスポンス封筒。 */
export type ReviewListResponse = {
  data: ReviewSummary[];
  meta: ReviewListMeta;
};
