import { pageItems } from "./pageItems";
import styles from "./Pagination.module.css";

export type PaginationProps = {
  /** 現在ページ（1 始まり）。 */
  currentPage: number;
  /** 総ページ数。 */
  totalPages: number;
  onPageChange: (page: number) => void;
  /** 現在ページの左右に出す番号数。 */
  siblings?: number;
};

/** ページ切り替えが動くページネーション。1 ページ以下なら何も描画しない。 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblings = 1,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = pageItems(currentPage, totalPages, siblings);

  return (
    <nav className={styles.wrap} aria-label="ページネーション">
      <button
        type="button"
        className={styles.page}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="前のページ"
      >
        ‹
      </button>

      {items.map((item) =>
        typeof item === "number" ? (
          <button
            key={item}
            type="button"
            className={`${styles.page} ${item === currentPage ? styles.current : ""}`.trim()}
            onClick={() => onPageChange(item)}
            aria-label={`${item}ページ目`}
            aria-current={item === currentPage ? "page" : undefined}
          >
            {item}
          </button>
        ) : (
          <span key={item} className={styles.ellipsis} aria-hidden="true">
            …
          </span>
        ),
      )}

      <button
        type="button"
        className={styles.page}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="次のページ"
      >
        ›
      </button>
    </nav>
  );
}
