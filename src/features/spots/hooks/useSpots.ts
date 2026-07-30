import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSpot, fetchSpots } from "../api/spots-api";

/** スポット一覧の query key。追加・編集後の無効化にも使う。 */
export const spotsQueryKey = ["spots"] as const;

/** スポット一覧を取得する（GET /api/v1/tourism/spots）。 */
export function useSpots() {
  return useQuery({
    queryKey: spotsQueryKey,
    queryFn: fetchSpots,
  });
}

/** スポットを追加する（POST）。成功時は一覧キャッシュを無効化して再取得させる。 */
export function useCreateSpot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSpot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spotsQueryKey });
    },
  });
}
