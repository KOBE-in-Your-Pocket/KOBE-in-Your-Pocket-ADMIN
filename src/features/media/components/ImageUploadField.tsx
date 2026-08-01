import { type ChangeEvent, useId, useRef, useState } from "react";
import { isApiError, isNetworkError } from "../../../api";
import { Spinner } from "../../../components";
import { useUploadImage } from "../hooks/useUploadImage";
import styles from "./ImageUploadField.module.css";

type ImageUploadFieldProps = {
  /** 現在の画像 URL（アップロード済み）。未設定なら空文字。 */
  value: string;
  /** アップロード成功で得た URL を親フォームへ渡す。 */
  onChange: (imageUrl: string) => void;
  /** アップロード中フラグの変化を親へ通知する（保存ボタンの無効化などに使う）。 */
  onUploadingChange?: (uploading: boolean) => void;
  label?: string;
  disabled?: boolean;
};

/**
 * 画像ファイルを選択して S3 にアップロードし、得た URL を扱うフィールド。
 *
 * URL 直接入力の代わりに、選択→アップロード→プレビュー表示までを内包する。
 * スポット・避難所など imageUrl を持つフォームで共通利用する。
 */
export function ImageUploadField({
  value,
  onChange,
  onUploadingChange,
  label = "画像",
  disabled = false,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadImage();
  const [error, setError] = useState<string | null>(null);

  const openPicker = () => {
    if (disabled || upload.isPending) return;
    inputRef.current?.click();
  };

  const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // 同じファイルを選び直しても change が発火するよう input をリセットする。
    e.target.value = "";
    if (!file) return;

    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください。");
      return;
    }

    onUploadingChange?.(true);
    upload.mutate(file, {
      onSuccess: (imageUrl) => onChange(imageUrl),
      onError: (err) => setError(uploadErrorMessage(err)),
      onSettled: () => onUploadingChange?.(false),
    });
  };

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={onFileSelected}
        disabled={disabled || upload.isPending}
      />

      <div className={styles.dropzone}>
        {upload.isPending ? (
          <div className={styles.status} role="status">
            <Spinner size="sm" label={null} />
            <span>アップロード中…</span>
          </div>
        ) : value !== "" ? (
          <div className={styles.preview}>
            <img className={styles.previewImage} src={value} alt="" />
            <button
              type="button"
              className={styles.changeButton}
              onClick={openPicker}
              disabled={disabled}
            >
              画像を変更
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.pickButton}
            onClick={openPicker}
            disabled={disabled}
          >
            <span className={styles.pickLabel}>画像を選択</span>
            <span className={styles.hint}>クリックして画像ファイルを選択</span>
          </button>
        )}
      </div>

      {error !== null && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** アップロード失敗の例外をユーザー向け文言に変換する（生メッセージは出さない）。 */
function uploadErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.isUnauthorized) {
      return "ログインが必要です。再度ログインしてください。";
    }
    if (error.isForbidden) {
      return "画像をアップロードする権限がありません。";
    }
    if (error.status === 413) {
      return "画像サイズが大きすぎます。より小さい画像を選択してください。";
    }
    if (error.status === 400 || error.violations.length > 0) {
      return "この画像はアップロードできません。別の画像を選択してください。";
    }
    return "画像のアップロードに失敗しました。時間をおいて再度お試しください。";
  }
  if (isNetworkError(error)) {
    return error.message;
  }
  return "画像のアップロードに失敗しました。時間をおいて再度お試しください。";
}
