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
 * 成功時は一覧キャッシュを無効化して再取得する。画面側で行を消さないのは、
 * 削除が Supabase Auth と DB の 2 段階で、サーバーの結果を正とするため。
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}
