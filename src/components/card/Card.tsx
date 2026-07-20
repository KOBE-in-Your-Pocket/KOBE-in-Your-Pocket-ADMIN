import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** カード見出し。省略時はタイトル行を出さない。 */
  title?: ReactNode;
  children: ReactNode;
};

/** 画面共通の白いパネル。 */
export function Card({ title, className = "", children, ...props }: CardProps) {
  return (
    <div className={`${styles.card} ${className}`.trim()} {...props}>
      {title !== undefined && <div className={styles.title}>{title}</div>}
      {children}
    </div>
  );
}
