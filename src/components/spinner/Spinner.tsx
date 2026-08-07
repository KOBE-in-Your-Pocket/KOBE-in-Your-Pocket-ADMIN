import type { CSSProperties } from "react";
import styles from "./Spinner.module.css";

const SIZE = {
  sm: { size: 14, border: 2 },
  md: { size: 20, border: 2 },
  lg: { size: 42, border: 4 },
} as const;

export type SpinnerSize = keyof typeof SIZE;

export type SpinnerProps = {
  size?: SpinnerSize;
  /** ボタンなど濃い背景の上に置く場合に白系の配色にする。 */
  onDark?: boolean;
  /**
   * スクリーンリーダー向けのラベル。
   * 周囲に status 領域がある場合は null を渡して読み上げを抑制する。
   */
  label?: string | null;
  className?: string;
};

/** 読み込み中を示す回転インジケータ。 */
export function Spinner({
  size = "md",
  onDark = false,
  label = "読み込み中",
  className = "",
}: SpinnerProps) {
  const { size: px, border } = SIZE[size];
  const style = {
    "--spinner-size": `${px}px`,
    "--spinner-border": `${border}px`,
  } as CSSProperties;

  return (
    <span
      className={`${styles.spinner} ${onDark ? styles.onDark : ""} ${className}`.trim()}
      style={style}
      // label が無いときは装飾扱いにして二重読み上げを避ける
      role={label === null ? "presentation" : "status"}
      aria-label={label ?? undefined}
      aria-hidden={label === null || undefined}
    />
  );
}
