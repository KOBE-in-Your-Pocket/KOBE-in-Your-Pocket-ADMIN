import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteUser, fetchUsers } from "../api/users-api";

/** ユーザー一覧の query key。 */
export const usersQueryKey = ["users"] as const;

/** ユーザー一覧を取得する（GET /api/v1/users）。 */
export function useUsers() {
  return useQuery({
    queryKey: usersQueryKey,
    queryFn: fetchUsers,
  });
}

/**
 * ユーザーを削除する（DELETE）。Backend は admin 専用。
 *
 * 画面側で行を消さないのは、削除が Supabase Auth と DB の 2 段階で、
 * サーバーの結果を正とするため。
 *
 * 無効化は `onSuccess` ではなく **`onSettled`**（成功・失敗とも）で行う。
 * 他の運営者が先に削除していると Backend は 404 を返し、`onSuccess` だけだと
 * 「既に削除されています」と表示しながら**その行が一覧に残り続ける**。
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}
