import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

// native の title（string のツールチップ）と ReactNode 見出しが交差しないよう除外する。
export type CardProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  /** カード見出し。省略時はタイトル行を出さない。 */
  title?: ReactNode;
  children: ReactNode;
};

/** 画面共通の白いパネル。 */
export function Card({ title, className = "", children, ...props }: CardProps) {
  return (
    <div className={`${styles.card} ${className}`.trim()} {...props}>
      {/* false / "" / null / undefined は見出し無しとして扱い、余白を作らない（0 は表示） */}
      {(title || title === 0) && (
        <div className={styles.title}>{title}</div>
      )}
      {children}
    </div>
  );
}
