import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReportDecision } from "../../../types";
import { useDeleteReview } from "../../reviews";
import { fetchReviewReports, handleReviewReports } from "../api/reports-api";

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
 * 承認・拒否は口コミを消さないため、レビュー一覧は無効化しない。
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

/**
 * 拒否済みの口コミを後から削除する（DELETE /api/v1/tourism/reviews/{reviewId}）。
 *
 * 削除は reviews feature の公開 API（[useDeleteReview]）に任せる。レビュー一覧の無効化は
 * そちらが行うので、ここでは通報一覧だけを無効化する（reviews の query key を直接触らない）。
 */
export function useDeleteReportedReview() {
  const queryClient = useQueryClient();
  const deleteReview = useDeleteReview();
  return useMutation({
    mutationFn: (reviewId: string) => deleteReview.mutateAsync(reviewId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reviewReportsQueryKey });
    },
  });
}
