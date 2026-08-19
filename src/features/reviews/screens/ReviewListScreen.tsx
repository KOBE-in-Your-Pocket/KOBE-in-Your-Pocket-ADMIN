import { useMemo, useState } from "react";
import { isApiError, isNetworkError } from "../../../api";
import {
  Button,
  Card,
  type Column,
  ConfirmDialog,
  EmptyBoxIcon,
  Pagination,
  SearchInput,
  StarRating,
  Table,
} from "../../../components";
import { DEFAULT_PAGE_SIZE } from "../../../lib/constants";
import { formatDate } from "../../../lib/date";
import { languageLabel } from "../../../lib/language";
import type { ReviewSummary } from "../../../types";
import { RATINGS } from "../api/reviews-api";
import { useDeleteReview, useReviews } from "../hooks/useReviews";
import styles from "./ReviewListScreen.module.css";

export function ReviewListScreen() {
  const { data, isLoading, isError } = useReviews();
  const deleteReview = useDeleteReview();

  const [spot, setSpot] = useState("all");
  const [rating, setRating] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<ReviewSummary | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const reviews = data?.data;

  /**
   * スポット候補は「レビューが存在するスポット」から作る。
   *
   * スポット一覧 API から作れば 0 件のスポットも選べるが、reviews feature が spots feature に
   * 依存することになるため見送っている。0 件のスポットを選んでも空表示になるだけで、
   * モデレーション用途では実害が小さい。
   */
  const spotOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const r of reviews ?? []) byId.set(r.spotId, r.spotName);
    return [...byId].map(([id, name]) => ({ id, name }));
  }, [reviews]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (reviews ?? []).filter(
      (r) =>
        (spot === "all" || r.spotId === spot) &&
        // Backend の rating は 1〜5 の整数なので、そのまま突き合わせる
        (rating === "all" || r.rating.value === Number(rating)) &&
        (keyword === "" || r.comment.toLowerCase().includes(keyword)),
    );
  }, [reviews, spot, rating, search]);

  const totalPages = Math.ceil(filtered.length / DEFAULT_PAGE_SIZE);
  // 削除で件数が減ると page が totalPages を超えて空表示になるため、有効範囲へ丸める。
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const pageItems = filtered.slice(
    (currentPage - 1) * DEFAULT_PAGE_SIZE,
    currentPage * DEFAULT_PAGE_SIZE,
  );

  const onConfirmDelete = () => {
    if (!target) return;
    setDeleteError(null);
    deleteReview.mutate(target.id, {
      onSuccess: () => setTarget(null),
      onError: (error) => {
        setDeleteError(deleteErrorMessage(error));
        setTarget(null);
      },
    });
  };

  const columns: Column<ReviewSummary>[] = [
    { key: "spotName", header: "スポット名", primary: true },
    {
      key: "rating",
      header: "評価",
      headerLabel: "評価",
      cell: (r) => <StarRating rating={r.rating.value} showValue />,
    },
    {
      key: "comment",
      header: "コメント",
      cell: (r) => <span className={styles.comment}>{r.comment}</span>,
    },
    { key: "author", header: "投稿者", cell: (r) => r.author.name },
    { key: "lang", header: "言語", cell: (r) => languageLabel(r.language) },
    { key: "postedAt", header: "投稿日", cell: (r) => formatDate(r.postedAt) },
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
            {spotOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
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

        {deleteError && (
          <div className={styles.errorBlock} role="alert">
            {deleteError}
          </div>
        )}

        {isError ? (
          <div className={styles.errorBlock} role="alert">
            レビューの取得に失敗しました。時間をおいて再度お試しください。
          </div>
        ) : isLoading ? (
          <Table columns={columns} data={[]} rowKey={(r) => r.id} loading />
        ) : filtered.length > 0 ? (
          <>
            <Table columns={columns} data={pageItems} rowKey={(r) => r.id} />
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
              {reviews?.length === 0
                ? "レビューがありません"
                : "該当するレビューがありません"}
            </div>
          </div>
        )}
      </Card>

      {target && (
        <ConfirmDialog
          title="レビューを削除しますか？"
          message={`「${target.spotName}」への ${target.author.name} さんのレビューを削除します。`}
          note="この操作は元に戻せません。"
          loading={deleteReview.isPending}
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
    // 削除は運営ロール限定。権限変更直後などに起こりうる。
    if (error.isForbidden) {
      return "レビューを削除する権限がありません。";
    }
    // 他の運営者が先に削除した場合。一覧は再取得されるので実害はない。
    if (error.status === 404) {
      return "このレビューは既に削除されています。";
    }
  }
  if (isNetworkError(error)) {
    return error.message;
  }
  return "レビューの削除に失敗しました。時間をおいて再度お試しください。";
}
