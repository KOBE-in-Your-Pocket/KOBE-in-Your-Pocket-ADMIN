import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeTone =
  | "primary"
  | "operator"
  | "success"
  | "warning"
  | "danger";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  children: ReactNode;
};

/** ロール・ステータス等を示すラベル。 */
export function Badge({
  tone = "primary",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`${styles.badge} ${styles[tone]} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}
