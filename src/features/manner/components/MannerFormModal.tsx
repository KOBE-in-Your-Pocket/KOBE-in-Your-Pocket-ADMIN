import { useId, useState } from "react";
import { Button, Input, Modal } from "../../../components";
import {
  LANG_KEYS,
  MANNER_KINDS,
  MANNER_SCOPES,
  type LangKey,
  type MannerItemDetail,
  type MannerItemInput,
  type MannerKind,
  type MannerLocalization,
  type MannerScope,
} from "../../../types";
import { ImageUploadField } from "../../media";
import { emptyLocalizations, toMannerId } from "../api/manner-api";
import { iconLabel, KIND_LABELS, SCOPE_LABELS } from "../api/manner-constants";
import styles from "./MannerFormModal.module.css";

/** 言語タブの並び順。スポット登録フォームと同じ。 */
const LANG_LABELS: Record<LangKey, string> = {
  ja: "日本語",
  en: "English",
  ko: "한국어",
  zh: "中文",
};

/** 関連スポットの選択肢。名前が引けないときは呼び出し側が null を渡す。 */
export type SpotOption = { id: string; name: string };

export type MannerFormModalProps = {
  /** 編集対象。未指定なら新規追加。 */
  item?: MannerItemDetail;
  /**
   * 関連スポットの選択肢。**取得できていないときは null**。
   *
   * 0 件（空配列）と区別する。取得できていないのに「スポットがありません」と出すと、
   * 関連づけを設定できない理由が分からない。
   */
  spotOptions: SpotOption[] | null;
  /** スポット一覧を取得中か。取得中と失敗で文言を変えるために受け取る。 */
  spotsLoading: boolean;
  saving: boolean;
  error?: string | null;
  onSubmit: (input: MannerItemInput) => void;
  onClose: () => void;
};

/**
 * マナー項目の追加・編集フォーム。
 *
 * タイトルと説明は 4 言語すべて必須。1 言語でも欠けると、その言語のアプリで項目が
 * 出せない（ジャンルの表示名と同じ理由）。言語はタブで切り替えるが、**未入力のタブには
 * 印を付ける**。タブの裏でエラーが隠れると、保存できない理由が分からなくなる。
 *
 * ID は入力させない。英語タイトルの slug から採番する想定（ジャンル #153 と同じ扱い）。
 */
export function MannerFormModal({
  item,
  spotOptions,
  spotsLoading,
  saving,
  error,
  onSubmit,
  onClose,
}: MannerFormModalProps) {
  const titleId = useId();
  const kindId = useId();
  const scopeId = useId();
  const isEdit = item !== undefined;

  const [langTab, setLangTab] = useState<LangKey>("ja");
  const [localizations, setLocalizations] = useState<
    MannerItemDetail["localizations"]
  >(item ? cloneLocalizations(item.localizations) : emptyLocalizations());
  const [kind, setKind] = useState<MannerKind>(item?.kind ?? "manner");
  const [scope, setScope] = useState<MannerScope>(item?.scope ?? "local");
  const [iconUrl, setIconUrl] = useState<string>(item?.iconUrl ?? "");
  const [iconUploading, setIconUploading] = useState(false);
  // 既存キーは編集させない。画像を上げるまでのフォールバック表示にだけ使う。
  const icon = item?.icon ?? "";
  const [relatedSpotIds, setRelatedSpotIds] = useState<string[]>(
    item?.relatedSpotIds ?? [],
  );
  const [touched, setTouched] = useState(false);

  // 未入力の言語。タブの印と保存可否の両方に使う。
  const incompleteLangs = LANG_KEYS.filter(
    (lang) =>
      localizations[lang].title.trim() === "" ||
      localizations[lang].description.trim() === "",
  );
  // 追加時のみ、英語タイトルから ID を作れるかを見る（編集時は ID 確定済み）。
  const idError =
    isEdit || localizations.en.title.trim() === ""
      ? null
      : toMannerId(localizations.en.title) === ""
        ? "English のタイトルに半角英数字を含めてください。ID を作れません。"
        : null;
  /*
    画像もキーも無い項目は、アプリでアイコンを描けない（従来キーのフォールバックすら
    効かない）。既存項目はキーを持っているので、画像未設定のままでも保存できる。
  */
  const iconError =
    iconUrl === "" && icon === "" ? "アイコン画像を選択してください。" : null;
  const canSubmit =
    incompleteLangs.length === 0 && idError === null && iconError === null;

  const setField = (field: keyof MannerLocalization, value: string) => {
    setLocalizations((prev) => ({
      ...prev,
      [langTab]: { ...prev[langTab], [field]: value },
    }));
  };

  const submit = () => {
    setTouched(true);
    if (!canSubmit) return;
    onSubmit({
      icon,
      iconUrl: iconUrl === "" ? null : iconUrl,
      kind,
      scope,
      relatedSpotIds,
      localizations: Object.fromEntries(
        LANG_KEYS.map((lang) => [
          lang,
          {
            title: localizations[lang].title.trim(),
            description: localizations[lang].description.trim(),
          },
        ]),
      ) as MannerItemDetail["localizations"],
    });
  };

  /** そのタブに直すところがあるか（未入力、または English の ID が作れない）。 */
  const needsFix = (lang: LangKey): boolean =>
    incompleteLangs.includes(lang) || (lang === "en" && idError !== null);

  const current = localizations[langTab];
  const showLangError = touched && incompleteLangs.length > 0;

  return (
    <Modal onClose={onClose} labelledBy={titleId} width={640} padding="0">
      <div className={styles.head}>
        <h2 id={titleId} className={styles.title}>
          {isEdit ? "マナー項目を編集" : "マナー項目を追加"}
        </h2>
        {isEdit && <span className={styles.itemId}>{item.id}</span>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className={styles.tabs} role="tablist" aria-label="言語">
          {LANG_KEYS.map((lang) => (
            <button
              key={lang}
              type="button"
              role="tab"
              aria-selected={lang === langTab}
              className={lang === langTab ? styles.tabActive : styles.tab}
              onClick={() => setLangTab(lang)}
            >
              {LANG_LABELS[lang]}
              {/* 直すべきタブに印を付ける。切り替えないと気付けない状態を作らない。 */}
              {touched && needsFix(lang) && (
                <span className={styles.tabMark} aria-label="要修正">
                  ●
                </span>
              )}
            </button>
          ))}
        </div>

        <div className={styles.body}>
          <Input
            label={`タイトル（${LANG_LABELS[langTab]}）`}
            value={current.title}
            onChange={(e) => setField("title", e.target.value)}
            required
            error={
              touched && current.title.trim() === ""
                ? "入力してください。"
                : undefined
            }
            hint={
              langTab === "en" && !isEdit
                ? "このタイトルから項目の ID が自動で作られます。"
                : undefined
            }
          />
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${titleId}-desc`}>
              説明（{LANG_LABELS[langTab]}）
              <span className={styles.required} aria-hidden="true">
                *
              </span>
            </label>
            <textarea
              id={`${titleId}-desc`}
              className={styles.textarea}
              value={current.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="一覧カードと詳細に出る説明文"
            />
            {touched && current.description.trim() === "" && (
              <span className={styles.error} role="alert">
                入力してください。
              </span>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={kindId}>
                種別
              </label>
              <select
                id={kindId}
                className={styles.select}
                value={kind}
                onChange={(e) => setKind(e.target.value as MannerKind)}
              >
                {MANNER_KINDS.map((value) => (
                  <option key={value} value={value}>
                    {KIND_LABELS[value]}
                  </option>
                ))}
              </select>
              <span className={styles.hint}>
                ルールは法令・条例上の決まり。アプリでは一段強調されます。
              </span>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={scopeId}>
                適用範囲
              </label>
              <select
                id={scopeId}
                className={styles.select}
                value={scope}
                onChange={(e) => setScope(e.target.value as MannerScope)}
              >
                {MANNER_SCOPES.map((value) => (
                  <option key={value} value={value}>
                    {SCOPE_LABELS[value]}
                  </option>
                ))}
              </select>
              <span className={styles.hint}>
                アプリの絞り込みに使われます。
              </span>
            </div>
          </div>

          <div className={styles.field}>
            <ImageUploadField
              label="アイコン画像"
              value={iconUrl}
              onChange={setIconUrl}
              onUploadingChange={setIconUploading}
              disabled={saving}
            />
            {/*
              画像が未設定の既存項目は、従来のアイコン識別キーでアプリに表示される。
              その状態を黙って隠すと「画像が無いのに何か出ている」理由が分からない。
            */}
            {iconUrl === "" && icon !== "" && (
              <span className={styles.hint}>
                画像は未設定です。アプリでは従来のアイコン（{iconLabel(icon)}）で
                表示されます。
              </span>
            )}
            {touched && iconError && (
              <p className={styles.error} role="alert">
                {iconError}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <span className={styles.label}>関連スポット</span>
            {spotOptions === null ? (
              <p className={styles.hint}>
                {spotsLoading
                  ? "スポット一覧を読み込み中です…"
                  : "スポット一覧を取得できないため選択できません。"}
                {relatedSpotIds.length > 0 &&
                  `現在の関連づけ（${relatedSpotIds.join(", ")}）はそのまま保存されます。`}
              </p>
            ) : spotOptions.length === 0 ? (
              <p className={styles.hint}>登録済みのスポットがありません。</p>
            ) : (
              <div className={styles.spotList}>
                {spotOptions.map((spot) => (
                  <label key={spot.id} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={relatedSpotIds.includes(spot.id)}
                      onChange={(e) =>
                        setRelatedSpotIds((prev) =>
                          e.target.checked
                            ? [...prev, spot.id]
                            : prev.filter((id) => id !== spot.id),
                        )
                      }
                    />
                    {spot.name}
                  </label>
                ))}
              </div>
            )}
            <span className={styles.hint}>
              選んだスポットの詳細画面に、この項目が「この場所のマナー」として出ます。
            </span>
          </div>

          {/*
            保存できない理由は、どの言語タブを開いていても見える位置に出す。
            タブの中だけに出すと、切り替えるまで「押しても何も起きない」状態になる。
          */}
          {showLangError && (
            <p className={styles.error} role="alert">
              すべての言語のタイトルと説明を入力してください（未入力:{" "}
              {incompleteLangs.map((lang) => LANG_LABELS[lang]).join(" / ")}）。
            </p>
          )}

          {touched && idError && (
            <p className={styles.error} role="alert">
              {idError}
            </p>
          )}

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit" loading={saving} disabled={iconUploading}>
            {isEdit ? "更新する" : "追加する"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function cloneLocalizations(
  localizations: MannerItemDetail["localizations"],
): MannerItemDetail["localizations"] {
  return Object.fromEntries(
    LANG_KEYS.map((lang) => [lang, { ...localizations[lang] }]),
  ) as MannerItemDetail["localizations"];
}
