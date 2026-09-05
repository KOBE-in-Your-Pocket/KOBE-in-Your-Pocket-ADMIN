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
 * 画面側で行を消さないのは、他の運営者の操作も含めたサーバーの状態を正とするため。
 *
 * 無効化は `onSuccess` ではなく **`onSettled`**（成功・失敗とも）で行う。
 * 他の運営者が先に削除していると Backend は 404 を返し、`onSuccess` だけだと
 * 「既に削除されています」と表示しながら**その行が一覧に残り続ける**。
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKey });
    },
  });
}
