import { useMemo, useState } from "react";
import { isApiError, isNetworkError } from "../../../api";
import {
  Button,
  Card,
  type Column,
  EmptyBoxIcon,
  Pagination,
  SearchInput,
  Table,
} from "../../../components";
import { DEFAULT_PAGE_SIZE } from "../../../lib/constants";
import { formatDate } from "../../../lib/date";
import type { UserListItem } from "../../../types";
import { useAuth } from "../../auth";
import { UserAvatar } from "../components/UserAvatar";
import { UserDeleteDialog } from "../components/UserDeleteDialog";
import { useDeleteUser, useUsers } from "../hooks/useUsers";
import styles from "./UserListScreen.module.css";

export function UserListScreen() {
  const { user } = useAuth();
  // Backend の削除 API は admin 専用（`@PreAuthorize("hasRole('ADMIN')")`）。
  // operator に出すと押しても 403 になるため、列ごと出し分ける。
  const isAdmin = user?.role === "admin";

  const { data, isLoading, isError } = useUsers();
  const deleteUser = useDeleteUser();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<UserListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      (data?.data ?? []).filter(
        (u) => search === "" || u.name.includes(search),
      ),
    [data, search],
  );

  const totalPages = Math.ceil(filtered.length / DEFAULT_PAGE_SIZE);
  // 削除で件数が減ると page が totalPages を超えて空表示になるため、有効範囲へ丸める。
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const pageItems = filtered.slice(
    (currentPage - 1) * DEFAULT_PAGE_SIZE,
    currentPage * DEFAULT_PAGE_SIZE,
  );

  const onConfirmDelete = (id: string) => {
    setDeleteError(null);
    deleteUser.mutate(id, {
      onSuccess: () => setTarget(null),
      onError: (error) => {
        setDeleteError(deleteErrorMessage(error));
        setTarget(null);
      },
    });
  };

  const baseColumns: Column<UserListItem>[] = [
    { key: "id", header: "ユーザーID" },
    { key: "name", header: "表示名", primary: true },
    {
      key: "avatar",
      header: "アイコン",
      headerLabel: "アイコン",
      cell: (u) => (
        <UserAvatar id={u.id} name={u.name} iconUrl={u.iconUrl} />
      ),
    },
    {
      key: "createdAt",
      header: "登録日",
      cell: (u) => formatDate(u.createdAt),
    },
  ];

  // 削除列は admin のみ。スプレッド条件で Column<T>[] の型を保つ。
  const columns: Column<UserListItem>[] = [
    ...baseColumns,
    ...(isAdmin
      ? [
          {
            key: "actions",
            header: "操作",
            align: "end",
            cell: (u: UserListItem) => (
              <div className={styles.rowActions}>
                <Button size="sm" variant="danger" onClick={() => setTarget(u)}>
                  削除
                </Button>
              </div>
            ),
          } satisfies Column<UserListItem>,
        ]
      : []),
  ];

  return (
    <>
      <h1 className={styles.pageTitle}>ユーザー一覧</h1>

      <Card>
        <div className={styles.search}>
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="ユーザー名で検索"
            aria-label="ユーザー名で検索"
          />
        </div>

        {deleteError && (
          <div className={styles.errorBlock} role="alert">
            {deleteError}
          </div>
        )}

        {isError ? (
          <div className={styles.errorBlock} role="alert">
            ユーザーの取得に失敗しました。時間をおいて再度お試しください。
          </div>
        ) : isLoading ? (
          <Table columns={columns} data={[]} rowKey={(u) => u.id} loading />
        ) : filtered.length > 0 ? (
          <>
            <Table columns={columns} data={pageItems} rowKey={(u) => u.id} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        ) : (
          <div className={styles.empty}>
            <EmptyBoxIcon size={46} />
            <div className={styles.emptyTitle}>
              {search === ""
                ? "ユーザーがいません"
                : "該当するユーザーがいません"}
            </div>
          </div>
        )}
      </Card>

      {target && (
        <UserDeleteDialog
          user={target}
          loading={deleteUser.isPending}
          onConfirm={onConfirmDelete}
          onClose={() => setTarget(null)}
        />
      )}
    </>
  );
}

/** 削除失敗の例外をユーザー向け文言に変換する（Backend の生メッセージは出さない）。 */
function deleteErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.isUnauthorized) {
      return "ログインが必要です。再度ログインしてください。";
    }
    // 削除は admin 専用。ボタンはロールで出し分けているが、権限変更直後などに起こりうる。
    if (error.isForbidden) {
      return "ユーザーを削除する権限がありません。";
    }
    // 他の運営者が先に削除した場合。一覧は再取得されるので実害はない。
    if (error.status === 404) {
      return "このユーザーは既に削除されています。";
    }
  }
  if (isNetworkError(error)) {
    return error.message;
  }
  return "ユーザーの削除に失敗しました。時間をおいて再度お試しください。";
}
