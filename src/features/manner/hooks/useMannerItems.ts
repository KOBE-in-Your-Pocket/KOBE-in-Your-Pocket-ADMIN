import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MannerItemInput } from "../../../types";
import {
  createMannerItem,
  deleteMannerItem,
  fetchMannerItems,
  updateMannerItem,
} from "../api/manner-api";

/** マナー項目一覧の query key。 */
export const mannerItemsQueryKey = ["manner-items"] as const;

/** マナー項目の一覧を取得する（GET /api/v1/manner/items）。 */
export function useMannerItems() {
  return useQuery({
    queryKey: mannerItemsQueryKey,
    queryFn: fetchMannerItems,
  });
}

/**
 * 追加・更新・削除は、いずれも成功・失敗ともに一覧を無効化する（`onSettled`）。
 *
 * 他の運営者の操作と競合しうるため、サーバーの状態を正とする。失敗時に再取得しないと
 * 「既に削除されています」と出しながら行が残る、といったズレが起きる
 * （ジャンル・ユーザー一覧と同じ方針）。
 */
export function useCreateMannerItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MannerItemInput) => createMannerItem(input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: mannerItemsQueryKey });
    },
  });
}

export function useUpdateMannerItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MannerItemInput }) =>
      updateMannerItem(id, input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: mannerItemsQueryKey });
    },
  });
}

export function useDeleteMannerItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMannerItem(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: mannerItemsQueryKey });
    },
  });
}
