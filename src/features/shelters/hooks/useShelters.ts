import { useQuery } from "@tanstack/react-query";
import { fetchShelters } from "../api/shelters-api";

/** 避難所一覧の query key。 */
export const sheltersQueryKey = ["shelters"] as const;

/** 避難所一覧を取得する（GET /api/v1/evacuation/shelters）。 */
export function useShelters() {
  return useQuery({
    queryKey: sheltersQueryKey,
    queryFn: fetchShelters,
  });
}
