import { useMemo, useState } from "react";
import {
  Button,
  Card,
  type Column,
  Pagination,
  SearchInput,
  Table,
} from "../../../components";
import { useAuth } from "../../auth";
import { UserDeleteDialog } from "../components/UserDeleteDialog";
import { MOCK_USERS, type MockUser } from "../mock-users";
import styles from "./UserListScreen.module.css";

const PAGE_SIZE = 10;

export function UserListScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // mock のため一覧はローカル state。削除のみ反映。実 API は #34 / 削除 #35。
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<MockUser | null>(null);

  const filtered = useMemo(
    () => users.filter((u) => search === "" || u.name.includes(search)),
    [users, search],
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onDeleted = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setTarget(null);
  };

  const baseColumns: Column<MockUser>[] = [
    { key: "id", header: "ユーザーID" },
    { key: "name", header: "表示名", primary: true },
    {
      key: "avatar",
      header: "アイコン",
      headerLabel: "アイコン",
      cell: (u) => (
        <div className={styles.avatar} style={{ background: u.color }}>
          {u.initial}
        </div>
      ),
    },
    { key: "date", header: "登録日" },
  ];

  // 削除列は admin のみ。スプレッド条件で Column<T>[] の型を保つ。
  const columns: Column<MockUser>[] = [
    ...baseColumns,
    ...(isAdmin
      ? [
          {
            key: "actions",
            header: "操作",
            align: "end",
            cell: (u: MockUser) => (
              <div className={styles.rowActions}>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setTarget(u)}
                >
                  削除
                </Button>
              </div>
            ),
          } satisfies Column<MockUser>,
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

        <Table
          columns={columns}
          data={pageItems}
          rowKey={(u) => u.id}
          empty="該当するユーザーがいません。"
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Card>

      {target && (
        <UserDeleteDialog
          user={target}
          onDeleted={onDeleted}
          onClose={() => setTarget(null)}
        />
      )}
    </>
  );
}
