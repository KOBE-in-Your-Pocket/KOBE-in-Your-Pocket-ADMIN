import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  type Column,
  ConfirmDialog,
  EmptyBoxIcon,
  Pagination,
  PinIcon,
  PlusIcon,
  SearchInput,
  Table,
} from "../../../components";
import { ROUTES, spotEditPath } from "../../../routes/paths";
import {
  GENRE_LABELS,
  GENRES,
  MOCK_SPOTS,
  type Genre,
  type MockSpot,
} from "../mock-spots";
import styles from "./SpotListScreen.module.css";

const PAGE_SIZE = 10;

export function SpotListScreen() {
  const navigate = useNavigate();

  // mock のため一覧はローカル state。削除のみ反映（保存は非永続）。実 API は #32。
  const [spots, setSpots] = useState<MockSpot[]>(MOCK_SPOTS);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<Genre | "all">("all");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<MockSpot | null>(null);

  const filtered = useMemo(
    () =>
      spots.filter(
        (s) =>
          (genre === "all" || s.genre === genre) &&
          (search === "" || s.name.includes(search)),
      ),
    [spots, genre, search],
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  // 削除で件数が減ると page が totalPages を超えて空表示になるため、有効範囲へ丸める。
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const clearFilter = () => {
    setSearch("");
    setGenre("all");
    setPage(1);
  };

  const onConfirmDelete = () => {
    if (target) setSpots((prev) => prev.filter((s) => s.id !== target.id));
    setTarget(null);
  };

  const columns: Column<MockSpot>[] = [
    {
      key: "thumb",
      header: "サムネイル",
      headerLabel: "サムネイル",
      cell: (s) => (
        <div className={styles.thumb} style={{ background: s.tint }}>
          <PinIcon size={18} color={s.color} />
        </div>
      ),
    },
    { key: "name", header: "名前", primary: true },
    { key: "genre", header: "ジャンル", cell: (s) => GENRE_LABELS[s.genre] },
    { key: "coord", header: "緯度・経度", cell: (s) => `${s.lat}, ${s.lng}` },
    { key: "date", header: "登録日" },
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

        {filtered.length > 0 ? (
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
