import { Button } from "../../../components";
import styles from "./UndoToast.module.css";

export type UndoToastProps = {
  message: string;
  /** 自動で確定するまでの時間（ミリ秒）。残り時間のバーに使う。 */
  durationMs: number;
  onUndo: () => void;
};

/**
 * 画面下に出す「取り消す」通知。
 *
 * 確定のタイマーは呼び出し側（useUndoableReportAction）が持つ。ここは見た目だけで、
 * バーは同じ時間で縮む CSS アニメーション。
 */
export function UndoToast({ message, durationMs, onUndo }: UndoToastProps) {
  return (
    <div className={styles.toast} role="status">
      <span className={styles.message}>{message}</span>
      <Button size="sm" variant="ghost" className={styles.undo} onClick={onUndo}>
        取り消す
      </Button>
      <span
        className={styles.bar}
        style={{ animationDuration: `${durationMs}ms` }}
        aria-hidden="true"
      />
    </div>
  );
}
