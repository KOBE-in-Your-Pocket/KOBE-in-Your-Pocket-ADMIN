import { useId, type ReactNode } from "react";
import { Button } from "../button";
import { WarningIcon } from "../icon/Icon";
import { Modal } from "../modal";
import styles from "./ConfirmDialog.module.css";

export type ConfirmDialogProps = {
  title: string;
  /** 対象を示す本文。 */
  message: ReactNode;
  /** 補足（取り消せない旨など）。 */
  note?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 破壊的操作かどうか。confirm ボタンの色が変わる。 */
  danger?: boolean;
  /** 確定処理中。ボタンを無効化しスピナーを出す。 */
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** 警告アイコン付きの確認ダイアログ。Modal と Button の組み合わせ。 */
export function ConfirmDialog({
  title,
  message,
  note,
  confirmLabel = "削除する",
  cancelLabel = "キャンセル",
  danger = true,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const titleId = useId();

  return (
    <Modal
      // 処理中は閉じるボタンだけでなく Escape / オーバーレイクリックも塞ぐ。
      // 削除確定の途中でダイアログが消えると状態が不整合になるため。
      onClose={loading ? () => {} : onClose}
      width={400}
      labelledBy={titleId}
      showClose={!loading}
    >
      <div className={styles.body}>
        <div className={styles.iconCircle}>
          <WarningIcon size={26} color="var(--color-warning-icon)" />
        </div>
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        <p className={styles.message}>{message}</p>
        {note && <p className={styles.note}>{note}</p>}
        <div className={styles.buttons}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
