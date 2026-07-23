/**
 * レビュー feature の API シーム。
 *
 * 現状は mock 固定データを同期で返す。実 API 接続時はこの関数の中身だけを
 * fetch（apiRequest）へ差し替えれば、画面側は変更不要。
 */
import { MOCK_REVIEWS } from "./mock-reviews";
import type { MockReview } from "./mock-reviews";

export type { MockReview } from "./mock-reviews";
export { RATINGS } from "./mock-reviews";

/** レビュー一覧を取得する（mock）。 */
export function listReviews(): MockReview[] {
  return MOCK_REVIEWS;
}
