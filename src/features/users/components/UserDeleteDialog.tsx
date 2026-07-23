import { useId, useState } from "react";
import { Button, ConfirmDialog, Modal } from "../../../components";
import type { MockUser } from "../api/users-api";
import styles from "./UserDeleteDialog.module.css";

export type UserDeleteDialogProps = {
  user: MockUser;
  onDeleted: (id: string) => void;
  onClose: () => void;
};

/**
 * ユーザー削除の2段階確認。
 *
 * 1段階目で意思確認し、2段階目でユーザーIDの入力一致を求める（誤削除防止）。
 * 実際の削除 API 接続は #35 で onDeleted を差し替える。
 */
export function UserDeleteDialog({
  user,
  onDeleted,
  onClose,
}: UserDeleteDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [input, setInput] = useState("");
  const titleId = useId();
  const confirmId = useId();

  const userLine = `${user.id}（${user.name}）`;
  const canDelete = input === user.id;

  if (step === 1) {
    return (
      <ConfirmDialog
        title="ユーザーを削除しますか？"
        message={`${userLine} を削除しますか？`}
        note="この操作は取り消せません。"
        confirmLabel="削除する"
        onConfirm={() => {
          setStep(2);
          setInput("");
        }}
        onClose={onClose}
      />
    );
  }

  return (
    <Modal onClose={onClose} width={420} labelledBy={titleId}>
      <h2 id={titleId} className={styles.title}>
        本当に削除しますか？
      </h2>
      <p className={styles.message}>{userLine} を完全に削除します。</p>
      <p className={styles.note}>この操作は取り消せません。</p>

      <label className={styles.label} htmlFor={confirmId}>
        確認のため、ユーザーIDを入力してください。
      </label>
      <input
        id={confirmId}
        className={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="user_XXXX"
        autoComplete="off"
      />

      <div className={styles.buttons}>
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button
          variant="danger"
          disabled={!canDelete}
          onClick={() => onDeleted(user.id)}
        >
          削除を確定
        </Button>
      </div>
    </Modal>
  );
}
