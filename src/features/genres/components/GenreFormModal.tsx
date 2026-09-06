import { useId, useState } from "react";
import { Button, Input, Modal } from "../../../components";
import { LANG_KEYS, type Genre, type LangKey } from "../../../types";
import { emptyLabels, toGenreCode } from "../api/genres-api";
import styles from "./GenreFormModal.module.css";

/** 言語ごとの入力ラベル。スポット登録フォームの言語タブと同じ並び順にそろえる。 */
const LANG_LABELS: Record<LangKey, string> = {
  ja: "日本語",
  en: "English",
  ko: "한국어",
  zh: "中文",
};

export type GenreFormModalProps = {
  /** 編集対象。未指定なら新規追加。 */
  genre?: Genre;
  /** 既存のコード一覧。新規追加時の重複チェックに使う。 */
  existingCodes: string[];
  saving: boolean;
  /** 保存失敗時に表示する文言。 */
  error?: string | null;
  onSubmit: (labels: Genre["labels"]) => void;
  onClose: () => void;
};

/**
 * ジャンルの追加・編集フォーム。
 *
 * コードは入力欄も表示も持たない。**Backend が English の表示名の slug から決める**
 * （Backend #153）ため運営が決められる値ではなく、スポット登録・一覧も含めて普段は
 * ラベルしか扱わない。常に見せると「良いコードにするために English を変える」動機を
 * 生むが、English は Client アプリに出る表示名なので触らせたくない。
 *
 * 例外は slug が既存と衝突して保存できないときだけ。理由が分からないと直せないので、
 * そのエラー文言にだけコードを出す。コードそのものは一覧の「コード」列で確認できる。
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

  const [labels, setLabels] = useState<Genre["labels"]>(
    genre ? { ...genre.labels } : emptyLabels(),
  );
  const [touched, setTouched] = useState(false);

  // 編集時はコードが確定済みで English を変えても変わらないため、検査しない。
  const codeError = isEdit
    ? null
    : validateCode(toGenreCode(labels.en), labels.en, existingCodes);
  const missingLangs = LANG_KEYS.filter((lang) => labels[lang].trim() === "");
  const canSubmit = codeError === null && missingLangs.length === 0;

  /**
   * 表示名 1 件ぶんのエラー文言。
   *
   * コード由来のエラーも English 欄に出す。運営が直せるのは English の表示名だけなので、
   * その入力欄に書くのが最短で伝わる。
   */
  const fieldError = (lang: LangKey): string | undefined => {
    if (!touched) return undefined;
    if (labels[lang].trim() === "") return "入力してください。";
    if (lang === "en") return codeError ?? undefined;
    return undefined;
  };

  const submit = () => {
    setTouched(true);
    if (!canSubmit) return;
    onSubmit(
      Object.fromEntries(
        LANG_KEYS.map((lang) => [lang, labels[lang].trim()]),
      ) as Genre["labels"],
    );
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
              error={fieldError(lang)}
              hint={
                lang === "en" && !isEdit
                  ? "この名前から識別子（コード）が自動で作られます。"
                  : undefined
              }
              placeholder={lang === "en" ? "Night View" : undefined}
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

/**
 * 新規追加時、English から作られるコードのチェック。問題が無ければ null。
 *
 * English が空のときは「入力してください。」を出す側に任せる。二重にエラーを出しても
 * 直し方は増えない。
 */
function validateCode(
  code: string,
  en: string,
  existingCodes: string[],
): string | null {
  if (en.trim() === "") return null;
  if (code === "") {
    return "半角英数字を含む名前にしてください。この名前から識別子を作れません。";
  }
  if (existingCodes.includes(code)) {
    return `既存のジャンルと同じ識別子（${code}）になります。別の名前にしてください。`;
  }
  return null;
}
