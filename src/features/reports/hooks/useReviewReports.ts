import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReportDecision } from "../../../types";
import {
  deleteReportedReview,
  fetchReviewReports,
  handleReviewReports,
} from "../api/reports-api";

/** 通報一覧の query key。 */
export const reviewReportsQueryKey = ["review-reports"] as const;

/** 通報された口コミの一覧を取得する（GET /api/v1/reports/reviews）。 */
export function useReviewReports() {
  return useQuery({
    queryKey: reviewReportsQueryKey,
    queryFn: fetchReviewReports,
  });
}

/**
 * 口コミへの通報に承認・拒否で対応する。
 *
 * 他の運営者と同時に対応しうるため、成功・失敗とも一覧を無効化する（`onSettled`）。
 *
 * 拒否後の削除（DELETE）をするとレビュー一覧（`["reviews"]`）も古くなる。
 * ただし reviews feature の内部（query key）を直接 import するとモジュール境界違反になるため、
 * mock の間は扱わない（mock の承認は実際のレビューを消さない）。
 */
export function useHandleReviewReports() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      decision,
    }: {
      reviewId: string;
      decision: ReportDecision;
    }) => handleReviewReports(reviewId, decision),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reviewReportsQueryKey });
    },
  });
}

/** 拒否済みの口コミを後から削除する。無効化の方針は [useHandleReviewReports] と同じ。 */
export function useDeleteReportedReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => deleteReportedReview(reviewId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reviewReportsQueryKey });
    },
  });
}
