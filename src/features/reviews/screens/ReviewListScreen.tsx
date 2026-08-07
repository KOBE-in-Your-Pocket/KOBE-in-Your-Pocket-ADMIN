import { useMemo, useState } from "react";
import {
  Button,
  Card,
  type Column,
  ConfirmDialog,
  Pagination,
  SearchInput,
  StarRating,
  Table,
} from "../../../components";
import { DEFAULT_PAGE_SIZE } from "../../../lib/constants";
import { RATINGS, listReviews, type MockReview } from "../api/reviews-api";
import styles from "./ReviewListScreen.module.css";

export function ReviewListScreen() {
  // mock のため一覧はローカル state。削除のみ反映。削除 API は Backend #86。
  const [reviews, setReviews] = useState<MockReview[]>(listReviews);
  const [spot, setSpot] = useState("all");
  const [rating, setRating] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<MockReview | null>(null);

  // スポット候補は実データに存在するものだけ
  const spotOptions = useMemo(
    () => [...new Set(reviews.map((r) => r.spot))],
    [reviews],
  );

  const filtered = useMemo(
    () =>
      reviews.filter(
        (r) =>
          (spot === "all" || r.spot === spot) &&
          // 4.5 は「★4」に含める
          (rating === "all" || Math.floor(r.rating) === Number(rating)) &&
          (search === "" || r.comment.includes(search)),
      ),
    [reviews, spot, rating, search],
  );

  const totalPages = Math.ceil(filtered.length / DEFAULT_PAGE_SIZE);
  // 削除で件数が減ると page が totalPages を超えて空表示になるため、有効範囲へ丸める。
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const pageItems = filtered.slice(
    (currentPage - 1) * DEFAULT_PAGE_SIZE,
    currentPage * DEFAULT_PAGE_SIZE,
  );

  const onConfirmDelete = () => {
    if (target) setReviews((prev) => prev.filter((r) => r.id !== target.id));
    setTarget(null);
  };

  const columns: Column<MockReview>[] = [
    { key: "spot", header: "スポット名", primary: true },
    {
      key: "rating",
      header: "評価",
      headerLabel: "評価",
      cell: (r) => <StarRating rating={r.rating} showValue />,
    },
    {
      key: "comment",
      header: "コメント",
      cell: (r) => <span className={styles.comment}>{r.comment}</span>,
    },
    { key: "author", header: "投稿者" },
    { key: "lang", header: "言語" },
    { key: "date", header: "投稿日" },
    {
      key: "actions",
      header: "操作",
      align: "end",
      cell: (r) => (
        <div className={styles.rowActions}>
          <Button size="sm" variant="danger" onClick={() => setTarget(r)}>
            削除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <h1 className={styles.pageTitle}>レビュー一覧</h1>

      <Card>
        <div className={styles.filters}>
          <select
            className={styles.select}
            value={spot}
            onChange={(e) => {
              setSpot(e.target.value);
              setPage(1);
            }}
            aria-label="スポットで絞り込む"
          >
            <option value="all">スポットを選択</option>
            {spotOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);
              setPage(1);
            }}
            aria-label="評価で絞り込む"
          >
            <option value="all">評価を選択</option>
            {RATINGS.map((n) => (
              <option key={n} value={n}>
                ★{n}
              </option>
            ))}
          </select>

          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="キーワードで検索"
            aria-label="コメントをキーワードで検索"
            maxWidth={300}
          />
        </div>

        <Table
          columns={columns}
          data={pageItems}
          rowKey={(r) => r.id}
          empty="該当するレビューがありません。"
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Card>

      {target && (
        <ConfirmDialog
          title="レビューを削除しますか？"
          message={`「${target.spot}」への ${target.author} さんのレビューを削除します。`}
          note="この操作は元に戻せません。"
          onConfirm={onConfirmDelete}
          onClose={() => setTarget(null)}
        />
      )}
    </>
  );
}
