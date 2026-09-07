import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isApiError, isNetworkError } from "../../../api";
import {
  Button,
  Card,
  type Column,
  ConfirmDialog,
  EmptyBoxIcon,
  Pagination,
  PlusIcon,
  SearchInput,
  Table,
} from "../../../components";
import { DEFAULT_PAGE_SIZE } from "../../../lib/constants";
import { ROUTES, spotEditPath } from "../../../routes/paths";
import type { Spot } from "../../../types";
import { useAuth } from "../../auth";
import { GENRE_LABELS, GENRES, type Genre } from "../api/spots-api";
import { SpotThumbnail } from "../components/SpotThumbnail";
import { useDeleteSpot, useSpots } from "../hooks/useSpots";
import styles from "./SpotListScreen.module.css";

/** ジャンル別のサムネイル配色（実 API はサムネ色を返さないため画面側で補う）。 */
const GENRE_COLORS: Record<Genre, { color: string; tint: string }> = {
  landmark: { color: "#E11D48", tint: "#FCE7EA" },
  nature: { color: "#2E7D32", tint: "#E4F1E5" },
  history: { color: "#B45309", tint: "#F6ECDE" },
  gourmet: { color: "#DC2626", tint: "#FBE5E5" },
  onsen: { color: "#0E7C86", tint: "#DEF0F1" },
};
const DEFAULT_GENRE_COLOR = { color: "#64748B", tint: "#F1F5F9" };

/** ジャンルの表示ラベル。未対応の値は生の文字列で返す。 */
function genreLabel(genre: string): string {
  return GENRE_LABELS[genre as Genre] ?? genre;
}

export function SpotListScreen() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useSpots();
  const { user } = useAuth();
  // Backend の削除 API は admin 専用（`@PreAuthorize("hasRole('ADMIN')")`）。
  // operator に出すと押しても 403 になるため、ユーザー一覧と同じく列ごと出し分ける。
  const isAdmin = user?.role === "admin";

  const deleteSpot = useDeleteSpot();

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<Genre | "all">("all");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<Spot | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      (data ?? []).filter(
        (s) =>
          (genre === "all" || s.genre === genre) &&
          (search === "" || s.name.includes(search)),
      ),
    [data, genre, search],
  );

  const totalPages = Math.ceil(filtered.length / DEFAULT_PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const pageItems = filtered.slice(
    (currentPage - 1) * DEFAULT_PAGE_SIZE,
    currentPage * DEFAULT_PAGE_SIZE,
  );

  const clearFilter = () => {
    setSearch("");
    setGenre("all");
    setPage(1);
  };

  const onConfirmDelete = () => {
    if (!target) return;
    setDeleteError(null);
    deleteSpot.mutate(target.id, {
      // 成否にかかわらずダイアログは閉じる。失敗は一覧上部のエラー表示で伝える。
      onSuccess: () => setTarget(null),
      onError: (err) => {
        setTarget(null);
        setDeleteError(deleteErrorMessage(err));
      },
    });
  };

  const columns: Column<Spot>[] = [
    {
      key: "thumb",
      header: "サムネイル",
      headerLabel: "サムネイル",
      cell: (s) => {
        const { color, tint } =
          GENRE_COLORS[s.genre as Genre] ?? DEFAULT_GENRE_COLOR;
        return (
          <SpotThumbnail imageUrl={s.media.imageUrl} color={color} tint={tint} />
        );
      },
    },
    { key: "name", header: "名前", primary: true },
    { key: "genre", header: "ジャンル", cell: (s) => genreLabel(s.genre) },
    { key: "address", header: "住所" },
    {
      key: "actions",
      header: "操作",
      cell: (s) => (
        <div className={styles.rowActions}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(spotEditPath(s.id))}
          >
            編集
          </Button>
          {isAdmin && (
            <Button size="sm" variant="danger" onClick={() => setTarget(s)}>
              削除
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <h1 className={styles.pageTitle}>スポット一覧</h1>

      <Card>
        {deleteError !== null && (
          <div className={styles.errorBlock} role="alert">
            {deleteError}
          </div>
        )}

        <div className={styles.filters}>
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="スポット名で検索"
            aria-label="スポット名で検索"
          />
          <select
            className={styles.select}
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value as Genre | "all");
              setPage(1);
            }}
            aria-label="ジャンルで絞り込む"
          >
            <option value="all">すべてのジャンル</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {GENRE_LABELS[g]}
              </option>
            ))}
          </select>
          <Button variant="ghost" size="sm" onClick={clearFilter}>
            フィルターをクリア
          </Button>
          <span className={styles.addButton}>
            <Button size="sm" onClick={() => navigate(ROUTES.spotNew)}>
              <PlusIcon size={15} />
              新規追加
            </Button>
          </span>
        </div>

        {isError ? (
          <div className={styles.errorBlock} role="alert">
            スポットの取得に失敗しました。時間をおいて再度お試しください。
          </div>
        ) : isLoading ? (
          <Table columns={columns} data={[]} rowKey={(s) => s.id} loading />
        ) : filtered.length > 0 ? (
          <>
            <Table columns={columns} data={pageItems} rowKey={(s) => s.id} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        ) : (
          <div className={styles.empty}>
            <EmptyBoxIcon size={46} />
            <div className={styles.emptyTitle}>スポットがありません</div>
            <div className={styles.emptyNote}>
              「新規追加」ボタンからスポットを追加してください。
            </div>
            <span className={styles.emptyAction}>
              <Button onClick={() => navigate(ROUTES.spotNew)}>新規追加</Button>
            </span>
          </div>
        )}
      </Card>

      {target && (
        <ConfirmDialog
          title="スポットを削除しますか？"
          message={`「${target.name}」を削除しますか？`}
          note="この操作は元に戻せません。"
          loading={deleteSpot.isPending}
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
      return "スポットを削除する権限がありません。";
    }
    // 他の運営者が先に削除した場合。一覧は再取得されるので実害はない。
    if (error.status === 404) {
      return "このスポットは既に削除されています。";
    }
  }
  if (isNetworkError(error)) {
    return error.message;
  }
  return "スポットの削除に失敗しました。時間をおいて再度お試しください。";
}
