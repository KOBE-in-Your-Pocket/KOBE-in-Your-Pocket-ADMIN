import styles from "./StarRating.module.css";

const STAR_COUNT = 5;

export type StarRatingProps = {
  /** 0〜5 の評価値。端数は中間色の星で表す。 */
  rating: number;
  /** 数値も併記する（例: ★★★★☆ 4.2）。 */
  showValue?: boolean;
};

function starClass(index: number, rating: number): string {
  if (index < Math.floor(rating)) return styles.full;
  if (index < rating) return styles.half;
  return styles.empty;
}

/** 5 段階評価の星表示。 */
export function StarRating({ rating, showValue = false }: StarRatingProps) {
  return (
    <span className={styles.stars} aria-label={`5段階中${rating}`}>
      {Array.from({ length: STAR_COUNT }, (_, i) => (
        <span key={i} className={starClass(i, rating)} aria-hidden="true">
          ★
        </span>
      ))}
      {showValue && (
        <span aria-hidden="true" style={{ marginLeft: 6 }}>
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}
