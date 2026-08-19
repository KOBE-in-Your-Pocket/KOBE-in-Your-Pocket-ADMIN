import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteReview, fetchReviews } from "../api/reviews-api";

/** レビュー一覧の query key。 */
export const reviewsQueryKey = ["reviews"] as const;

/** レビュー一覧を取得する（GET /api/v1/tourism/reviews）。 */
export function useReviews() {
  return useQuery({
    queryKey: reviewsQueryKey,
    queryFn: fetchReviews,
  });
}

/**
 * レビューを削除する（DELETE）。Backend は運営ロール限定。
 *
 * 成功時は一覧キャッシュを無効化して再取得する。画面側で行を消さないのは、
 * 他の運営者の操作も含めたサーバーの状態を正とするため。
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKey });
    },
  });
}
