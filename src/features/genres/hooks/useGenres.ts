import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Genre, GenreInput } from "../../../types";
import {
  createGenre,
  deleteGenre,
  fetchGenres,
  updateGenre,
} from "../api/genres-api";

/** ジャンル一覧の query key。 */
export const genresQueryKey = ["genres"] as const;

/** ジャンル一覧を取得する（現状は mock）。 */
export function useGenres() {
  return useQuery({
    queryKey: genresQueryKey,
    queryFn: fetchGenres,
  });
}

/**
 * 追加・更新・削除は、いずれも成功・失敗ともに一覧を無効化する（`onSettled`）。
 *
 * 実 API 化後は他の運営者の操作と競合しうるため、サーバーの状態を正とする。
 * 失敗時に再取得しないと「既に削除されています」と出しながら行が残る、といった
 * ズレが起きる（ユーザー一覧・レビュー一覧と同じ方針）。
 */
export function useCreateGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GenreInput) => createGenre(input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: genresQueryKey });
    },
  });
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, labels }: { code: string; labels: Genre["labels"] }) =>
      updateGenre(code, labels),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: genresQueryKey });
    },
  });
}

export function useDeleteGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => deleteGenre(code),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: genresQueryKey });
    },
  });
}
