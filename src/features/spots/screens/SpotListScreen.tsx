import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { GENRE_LABELS, GENRES, type Genre } from "../api/spots-api";
import { SpotThumbnail } from "../components/SpotThumbnail";
import { spotsQueryKey, useSpots } from "../hooks/useSpots";
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
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useSpots();

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<Genre | "all">("all");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<Spot | null>(null);

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
    // Backend にスポット削除 API が無いため、当面はキャッシュからのローカル削除
    // （非永続。再取得で戻る）。削除 API が実装されたら mutation へ差し替える。
    if (target) {
      queryClient.setQueryData<Spot[]>(spotsQueryKey, (old) =>
        old?.filter((s) => s.id !== target.id),
      );
    }
    setTarget(null);
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
    {
      key: "coord",
      header: "緯度・経度",
      cell: (s) =>
        `${s.coordinates.latitude.toFixed(4)}, ${s.coordinates.longitude.toFixed(4)}`,
    },
    {
      key: "actions",
      header: "操作",
      align: "end",
      cell: (s) => (
        <div className={styles.rowActions}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(spotEditPath(s.id))}
          >
            編集
          </Button>
          <Button size="sm" variant="danger" onClick={() => setTarget(s)}>
            削除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <h1 className={styles.pageTitle}>スポット一覧</h1>

      <Card>
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
          onConfirm={onConfirmDelete}
          onClose={() => setTarget(null)}
        />
      )}
    </>
  );
}
