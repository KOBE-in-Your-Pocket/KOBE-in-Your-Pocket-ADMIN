import { useId, useState } from "react";
import { Button, Input, Modal } from "../../../components";
import { LANG_KEYS, type Genre, type LangKey } from "../../../types";
import { emptyLabels } from "../api/genres-api";
import styles from "./GenreFormModal.module.css";

/** 言語ごとの入力ラベル。スポット登録フォームの言語タブと同じ並び順にそろえる。 */
const LANG_LABELS: Record<LangKey, string> = {
  ja: "日本語",
  en: "English",
  ko: "한국어",
  zh: "中文",
};

/** コードに使える文字。API のパスに入るため、英小文字・数字・ハイフンに限る。 */
const CODE_PATTERN = /^[a-z0-9-]+$/;

export type GenreFormModalProps = {
  /** 編集対象。未指定なら新規追加。 */
  genre?: Genre;
  /** 既存のコード一覧。新規追加時の重複チェックに使う。 */
  existingCodes: string[];
  saving: boolean;
  /** 保存失敗時に表示する文言。 */
  error?: string | null;
  onSubmit: (input: { code: string; labels: Genre["labels"] }) => void;
  onClose: () => void;
};

/**
 * ジャンルの追加・編集フォーム。
 *
 * コードは既存スポットの `genre` と突き合わせる識別子のため、**編集時は変更できない**。
 * 変更を許すと、その値を参照している既存スポットのジャンルが不明になる。
 */
export function GenreFormModal({
  genre,
  existingCodes,
  saving,
  error,
  onSubmit,
  onClose,
}: GenreFormModalProps) {
  const titleId = useId();
  const isEdit = genre !== undefined;

  const [code, setCode] = useState(genre?.code ?? "");
  const [labels, setLabels] = useState<Genre["labels"]>(
    genre ? { ...genre.labels } : emptyLabels(),
  );
  const [touched, setTouched] = useState(false);

  const codeError = validateCode(code, existingCodes, isEdit);
  const missingLangs = LANG_KEYS.filter((lang) => labels[lang].trim() === "");
  const canSubmit = codeError === null && missingLangs.length === 0;

  const submit = () => {
    setTouched(true);
    if (!canSubmit) return;
    onSubmit({
      code: code.trim(),
      labels: Object.fromEntries(
        LANG_KEYS.map((lang) => [lang, labels[lang].trim()]),
      ) as Genre["labels"],
    });
  };

  return (
    <Modal onClose={onClose} labelledBy={titleId} width={520}>
      <h2 id={titleId} className={styles.title}>
        {isEdit ? "ジャンルを編集" : "ジャンルを追加"}
      </h2>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Input
          label="コード"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isEdit}
          required
          error={touched ? (codeError ?? undefined) : undefined}
          hint={
            isEdit
              ? "既存スポットが参照しているため変更できません。"
              : "スポットに保存される識別子。英小文字・数字・ハイフンのみ（例: night-view）。"
          }
          placeholder="night-view"
        />

        <fieldset className={styles.labels}>
          <legend className={styles.legend}>
            表示名（すべての言語が必要）
          </legend>
          {LANG_KEYS.map((lang) => (
            <Input
              key={lang}
              label={LANG_LABELS[lang]}
              value={labels[lang]}
              onChange={(e) =>
                setLabels((prev) => ({ ...prev, [lang]: e.target.value }))
              }
              required
              error={
                touched && labels[lang].trim() === ""
                  ? "入力してください。"
                  : undefined
              }
            />
          ))}
        </fieldset>

        {/*
          全言語を必須にしているのは、1 言語でも欠けるとその言語のアプリで
          ジャンル名が出せなくなるため（現状のハードコード運用と同じ問題が再発する）。
        */}
        {touched && missingLangs.length > 0 && (
          <p className={styles.error} role="alert">
            すべての言語の表示名を入力してください。
          </p>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? "更新する" : "追加する"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** コードの入力チェック。問題が無ければ null。 */
function validateCode(
  code: string,
  existingCodes: string[],
  isEdit: boolean,
): string | null {
  if (isEdit) return null;

  const value = code.trim();
  if (value === "") return "入力してください。";
  if (!CODE_PATTERN.test(value)) {
    return "英小文字・数字・ハイフンのみ使えます。";
  }
  if (existingCodes.includes(value)) {
    return "このコードは既に使われています。";
  }
  return null;
}
