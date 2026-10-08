/**
 * 通報 feature の API。
 *
 * Backend の運営向け通報 API（Backend #145）に接続済み。いずれも運営ロール限定。
 *
 * ```
 * GET    /api/v1/reports/reviews?lang=ja&size=          口コミ単位にまとめた一覧
 * PATCH  /api/v1/reports/reviews/{reviewId}  { status }  未対応の通報をまとめて閉じる
 * ```
 *
 * 拒否後の口コミ削除（DELETE /api/v1/tourism/reviews/{reviewId}）は reviews feature の API を使う
 * （hooks/useReviewReports.ts の useDeleteReportedReview）。
 *
 * 「承認」は口コミを**削除しない**。PATCH `APPROVED` で通報を閉じると、口コミは管理画面に残ったまま
 * アプリでは非表示になる（一般向けのレビュー取得が `hiddenByReport: true` を返す / Backend #202）。
 */
import { apiRequest } from "../../../api";
import type { ReportDecision, ReviewReportListResponse } from "../../../types";

const REPORTS_PATH = "/api/v1/reports/reviews";

/** 管理画面の表示言語。スポット名の解決にのみ効く（口コミ本文は投稿言語のまま返る）。 */
const LIST_LANG = "ja";

/**
 * 1 リクエストで取得する上限。Backend の `ListReviewReportsService.MAX_SIZE` と同値（Backend #205）。
 *
 * 状態での絞り込みは画面側で行うため、上限まで一括取得する（他の一覧画面と同じ方針）。
 * 通報された口コミが上限を超えると超えた分は画面に出ない。対策は #116。
 */
const MAX_PAGE_SIZE = 200;

/** `PATCH /api/v1/reports/reviews/{reviewId}` の応答。画面では使わないが形を明示しておく。 */
type HandleReviewReportsResponse = {
  reviewId: string;
  status: ReportDecision;
  /** 今回閉じた通報の件数。他の運営者が先に閉じていれば 0。 */
  updatedCount: number;
};

/**
 * 通報された口コミの一覧を取得する（GET /api/v1/reports/reviews）。
 *
 * 並びは Backend が決める（未対応の通報が多い順 → 最新の通報が新しい順）。
 */
export function fetchReviewReports(): Promise<ReviewReportListResponse> {
  return apiRequest<ReviewReportListResponse>(
    `${REPORTS_PATH}?lang=${LIST_LANG}&size=${MAX_PAGE_SIZE}`,
  );
}

/**
 * 口コミへの未対応の通報にまとめて対応する（PATCH /api/v1/reports/reviews/{reviewId}）。
 *
 * - `APPROVED`（承認）: 口コミは残し（アプリでは非表示）、未対応の通報を承認済みにする
 * - `REJECTED`（拒否）: 口コミは残し、未対応の通報を拒否済みにする
 *
 * 対応済みの通報は Backend が触らない（担当者・日時の履歴を上書きしない）。
 * その口コミへの通報が 1 件も無ければ 404。
 */
export async function handleReviewReports(
  reviewId: string,
  decision: ReportDecision,
): Promise<void> {
  await apiRequest<HandleReviewReportsResponse>(
    `${REPORTS_PATH}/${encodeURIComponent(reviewId)}`,
    { method: "PATCH", json: { status: decision } },
  );
}
