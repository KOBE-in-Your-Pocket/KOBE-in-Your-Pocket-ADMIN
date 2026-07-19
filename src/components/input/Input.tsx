import { useId, type InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  /** エラー文言。指定すると aria-invalid が付き、入力欄が赤くなる。 */
  error?: string;
  /** 補足説明。error があるときは error を優先して表示する。 */
  hint?: string;
  /** 明示指定しない場合は useId で自動採番する。 */
  id?: string;
};

/**
 * ラベル・補足・エラーをまとめた入力欄。
 *
 * label と入力欄、エラー文言は id / aria-describedby で紐付けるため、
 * 呼び出し側は文字列を渡すだけでスクリーンリーダー対応が完了する。
 */
export function Input({
  label,
  error,
  hint,
  id,
  required,
  className = "",
  ...props
}: InputProps) {
  const autoId = useId();
  // 空文字も未指定として扱う。?? では "" が通ってしまい、
  // id が空になったり hint が hidden になったりする。
  const inputId = id || autoId;
  const describedById = `${inputId}-desc`;
  const description = error || hint;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.invalid : ""} ${className}`.trim()}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={description ? describedById : undefined}
        {...props}
      />
      {description && (
        <span
          id={describedById}
          className={error ? styles.error : styles.hint}
          // エラーは後から現れるため読み上げ対象にする
          role={error ? "alert" : undefined}
        >
          {description}
        </span>
      )}
    </div>
  );
}
