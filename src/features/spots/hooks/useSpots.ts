import { useQuery } from "@tanstack/react-query";
import { fetchSpots } from "../api/spots-api";

/** スポット一覧の query key。追加・編集後の無効化にも使う。 */
export const spotsQueryKey = ["spots"] as const;

/** スポット一覧を取得する（GET /api/v1/tourism/spots）。 */
export function useSpots() {
  return useQuery({
    queryKey: spotsQueryKey,
    queryFn: fetchSpots,
  });
}
