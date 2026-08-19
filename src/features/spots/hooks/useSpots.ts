import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RegisterSpotRequest } from "../../../types";
import {
  createSpot,
  deleteSpot,
  fetchSpotDetail,
  fetchSpots,
  updateSpot,
} from "../api/spots-api";

/** スポット一覧の query key。1件詳細（`["spots", id]`）も前方一致で巻き込む。 */
export const spotsQueryKey = ["spots"] as const;

/** 編集フォームが使う1件詳細の query key。 */
export const spotDetailQueryKey = (id: string) => ["spots", id] as const;

/** スポット一覧を取得する（GET /api/v1/tourism/spots）。 */
export function useSpots() {
  return useQuery({
    queryKey: spotsQueryKey,
    queryFn: fetchSpots,
  });
}

/**
 * 編集フォーム用に1件を全言語ぶん取得する。
 *
 * `id` が無い（追加モード）ときは実行しない。
 */
export function useSpotDetail(id: string | undefined) {
  return useQuery({
    queryKey: spotDetailQueryKey(id ?? ""),
    queryFn: () => fetchSpotDetail(id as string),
    enabled: id !== undefined,
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

/**
 * スポットを更新する（PUT）。
 *
 * 成功時は `["spots"]` を無効化する。詳細の key は `["spots", id]` なので前方一致で
 * まとめて無効化され、一覧も編集フォームも次回表示時に再取得される。
 */
export function useUpdateSpot(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: RegisterSpotRequest) => updateSpot(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spotsQueryKey });
    },
  });
}

/**
 * スポットを削除する（DELETE）。Backend は admin 専用。
 *
 * `["spots"]` を無効化して一覧を再取得する。削除済みの詳細キャッシュも
 * 前方一致で巻き込まれるため、個別の削除は不要。
 *
 * 無効化は `onSuccess` ではなく **`onSettled`**（成功・失敗とも）で行う。
 * 他の運営者が先に削除していると Backend は 404 を返し、`onSuccess` だけだと
 * 「既に削除されています」と表示しながら**その行が一覧に残り続ける**。
 */
export function useDeleteSpot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSpot,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: spotsQueryKey });
    },
  });
}
