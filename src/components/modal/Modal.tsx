import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "../icon/Icon";
import styles from "./Modal.module.css";
import { useFocusTrap } from "./useFocusTrap";

export type ModalProps = {
  onClose: () => void;
  /** ダイアログの最大幅（px）。 */
  width?: number;
  padding?: string;
  /** ヘッダー見出しの要素 id。指定すると aria-labelledby に使う。 */
  labelledBy?: string;
  /** 見出しがない場合のラベル文字列（aria-label）。 */
  label?: string;
  /** 右上の閉じるボタンを表示するか。 */
  showClose?: boolean;
  children: ReactNode;
};

/**
 * オーバーレイ・Escape で閉じるモーダル。
 *
 * body 直下に portal し、フォーカストラップ・背景スクロールロック・
 * フォーカス復帰（useFocusTrap）を備える。
 */
export function Modal({
  onClose,
  width = 400,
  padding = "28px 26px",
  labelledBy,
  label,
  showClose = true,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, true);

  // Escape で閉じる
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // 背景スクロールロック
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return createPortal(
    // オーバーレイ自身のクリックだけで閉じる。ダイアログ内で発生して
    // バブリングしてきたクリックでは閉じない（stopPropagation より堅い）。
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        style={{ maxWidth: width, padding }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : (label ?? "ダイアログ")}
        tabIndex={-1}
      >
        {showClose && (
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="閉じる"
          >
            <CloseIcon size={18} />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
