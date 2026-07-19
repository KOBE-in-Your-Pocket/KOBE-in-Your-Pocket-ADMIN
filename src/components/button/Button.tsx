import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "../spinner";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "md" | "sm";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 処理中。スピナーを表示し、二重送信を防ぐため操作を無効化する。 */
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  type = "button",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[size],
    styles[variant],
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <Spinner
          size="sm"
          onDark={variant === "primary" || variant === "danger"}
          // ボタン自身のラベルが読まれるため、スピナーは読み上げ対象にしない
          label={null}
        />
      )}
      {children}
    </button>
  );
}
