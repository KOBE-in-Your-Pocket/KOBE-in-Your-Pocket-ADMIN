import type { CSSProperties } from "react";
import { SearchIcon } from "../icon";
import styles from "./SearchInput.module.css";

export type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** 検索欄の最大幅（px）。 */
  maxWidth?: number;
  /** 視覚ラベルが無いため必須。aria-label に使う。 */
  "aria-label": string;
};

/** 虫眼鏡アイコン付きの検索入力。値は制御コンポーネントとして親が持つ。 */
export function SearchInput({
  value,
  onChange,
  placeholder,
  maxWidth = 320,
  "aria-label": ariaLabel,
}: SearchInputProps) {
  const style = { maxWidth } as CSSProperties;

  return (
    <div className={styles.search} style={style}>
      <SearchIcon size={15} className={styles.icon} />
      <input
        type="search"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
    </div>
  );
}
