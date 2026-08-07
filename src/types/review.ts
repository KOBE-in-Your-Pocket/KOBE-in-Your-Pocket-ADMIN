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
