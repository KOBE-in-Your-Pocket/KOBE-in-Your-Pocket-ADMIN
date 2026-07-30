import { useId, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { isApiError, isNetworkError } from "../../../api";
import { Button } from "../../../components";
import { ROUTES } from "../../../routes/paths";
import {
  LANG_KEYS,
  type LangKey,
  type Localized,
  type RegisterSpotRequest,
  type SpotLocalization,
} from "../../../types";
import {
  GENRE_LABELS,
  GENRES,
  LANGS,
  getSpot,
  type Genre,
} from "../api/spots-api";
import { useCreateSpot } from "../hooks/useSpots";
import styles from "./SpotFormScreen.module.css";

const EMPTY_LOCALIZED: Localized<string> = { ja: "", en: "", zh: "", ko: "" };

/** 神戸市中心部の座標。新規追加時の初期値。 */
const DEFAULT_COORD = { lat: "34.6937", lng: "135.1955" };

/** 言語ごとに入力する項目（Backend の localizations に対応）。 */
const LOCALIZED_FIELDS = [
  "name",
  "categoryLabel",
  "description",
  "businessHours",
  "address",
] as const;
type LocalizedField = (typeof LOCALIZED_FIELDS)[number];

type SpotForm = {
  name: Localized<string>;
  categoryLabel: Localized<string>;
  description: Localized<string>;
  businessHours: Localized<string>;
  address: Localized<string>;
  genre: Genre;
  lat: string;
  lng: string;
  imageUrl: string;
};

export function SpotFormScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const createSpot = useCreateSpot();

  const isEdit = id !== undefined;
  const editing = id !== undefined ? getSpot(id) : undefined;

  const genreId = useId();
  const latId = useId();
  const lngId = useId();
  const imageUrlId = useId();
  const nameId = useId();
  const categoryLabelId = useId();
  const descriptionId = useId();
  const businessHoursId = useId();
  const addressId = useId();

  const [langTab, setLangTab] = useState<LangKey>("ja");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SpotForm>(() => ({
    // 編集時は一覧が持つ値のみ復元できる（他項目は編集 API 未接続のため空）。
    name: editing ? { ...EMPTY_LOCALIZED, ja: editing.name } : EMPTY_LOCALIZED,
    categoryLabel: EMPTY_LOCALIZED,
    description: EMPTY_LOCALIZED,
    businessHours: EMPTY_LOCALIZED,
    address: EMPTY_LOCALIZED,
    genre: editing?.genre ?? "landmark",
    lat: editing?.lat ?? DEFAULT_COORD.lat,
    lng: editing?.lng ?? DEFAULT_COORD.lng,
    imageUrl: "",
  }));

  // 存在しない ID の編集は一覧へ戻す
  if (isEdit && !editing) return <Navigate to={ROUTES.spots} replace />;

  const setLocalized = (field: LocalizedField, value: string) =>
    setForm((prev) => ({
      ...prev,
      [field]: { ...prev[field], [langTab]: value },
    }));

  const onSave = () => {
    setError(null);
    // 編集は Backend に更新 API が無い（別 Issue）。従来どおり一覧へ戻す。
    if (isEdit) {
      navigate(ROUTES.spots);
      return;
    }
    const validationError = validate(form);
    if (validationError !== null) {
      setError(validationError);
      return;
    }
    createSpot.mutate(buildRequest(form), {
      onSuccess: () => navigate(ROUTES.spots),
      onError: (err) => setError(saveErrorMessage(err)),
    });
  };

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isEdit ? "スポットを編集" : "スポットを追加"}
        </h1>
        <div className={styles.headerButtons}>
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.spots)}
            disabled={createSpot.isPending}
          >
            キャンセル
          </Button>
          <Button onClick={onSave} loading={createSpot.isPending}>
            保存
          </Button>
        </div>
      </div>

      {error !== null && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <div className={styles.panel}>
        <div className={styles.tabs} role="tablist" aria-label="言語">
          {LANGS.map((lang) => (
            <button
              key={lang.key}
              type="button"
              role="tab"
              aria-selected={lang.key === langTab}
              className={lang.key === langTab ? styles.tabActive : styles.tab}
              onClick={() => setLangTab(lang.key)}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {/* 言語に依存しない項目 */}
          <div className={styles.column}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={genreId}>
                ジャンル
              </label>
              <select
                id={genreId}
                className={styles.input}
                value={form.genre}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    genre: e.target.value as Genre,
                  }))
                }
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {GENRE_LABELS[g]}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={latId}>
                緯度
              </label>
              <input
                id={latId}
                className={styles.input}
                value={form.lat}
                inputMode="decimal"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, lat: e.target.value }))
                }
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={lngId}>
                経度
              </label>
              <input
                id={lngId}
                className={styles.input}
                value={form.lng}
                inputMode="decimal"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, lng: e.target.value }))
                }
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={imageUrlId}>
                画像URL
              </label>
              <input
                id={imageUrlId}
                className={styles.input}
                type="url"
                value={form.imageUrl}
                placeholder="https://…"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                }
              />
              {/* 画像ファイル選択→S3 アップロードは Backend の presigned URL API が
                  必要なため別 Issue。当面は画像 URL を直接入力する。 */}
            </div>
          </div>

          {/* 言語ごとに切り替わる項目 */}
          <div className={styles.column}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={nameId}>
                名前（name）
              </label>
              <input
                id={nameId}
                className={styles.input}
                value={form.name[langTab]}
                onChange={(e) => setLocalized("name", e.target.value)}
                placeholder="名前を入力"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={categoryLabelId}>
                カテゴリ（categoryLabel）
              </label>
              <input
                id={categoryLabelId}
                className={styles.input}
                value={form.categoryLabel[langTab]}
                onChange={(e) => setLocalized("categoryLabel", e.target.value)}
                placeholder="例: ランドマーク"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={descriptionId}>
                説明（description）
              </label>
              <textarea
                id={descriptionId}
                className={styles.textarea}
                value={form.description[langTab]}
                onChange={(e) => setLocalized("description", e.target.value)}
                placeholder="説明を入力"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={businessHoursId}>
                営業時間（businessHours）
              </label>
              <input
                id={businessHoursId}
                className={styles.input}
                value={form.businessHours[langTab]}
                onChange={(e) => setLocalized("businessHours", e.target.value)}
                placeholder="例: 9:00-21:00"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={addressId}>
                住所（address）
              </label>
              <input
                id={addressId}
                className={styles.input}
                value={form.address[langTab]}
                onChange={(e) => setLocalized("address", e.target.value)}
                placeholder="住所を入力"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** 送信前のクライアント検証。問題があればユーザー向け文言、無ければ null。 */
function validate(form: SpotForm): string | null {
  if (form.imageUrl.trim() === "") {
    return "画像URLを入力してください。";
  }
  if (
    form.lat.trim() === "" ||
    form.lng.trim() === "" ||
    Number.isNaN(Number(form.lat)) ||
    Number.isNaN(Number(form.lng))
  ) {
    return "緯度・経度を数値で入力してください。";
  }
  // Backend は ja/en/zh/ko すべての必須項目が非空であることを要求する。
  const missing = LANG_KEYS.filter((lang) =>
    LOCALIZED_FIELDS.some((field) => form[field][lang].trim() === ""),
  );
  if (missing.length > 0) {
    const labels = missing.map(langLabel).join("・");
    return `すべての言語で必須項目を入力してください（未入力: ${labels}）。`;
  }
  return null;
}

/** フォームを Backend の登録リクエストへ変換する。 */
function buildRequest(form: SpotForm): RegisterSpotRequest {
  const localizations = {} as Localized<SpotLocalization>;
  for (const lang of LANG_KEYS) {
    localizations[lang] = {
      name: form.name[lang].trim(),
      categoryLabel: form.categoryLabel[lang].trim(),
      description: form.description[lang].trim(),
      businessHours: form.businessHours[lang].trim(),
      address: form.address[lang].trim(),
    };
  }
  return {
    genre: form.genre,
    coordinates: {
      latitude: Number(form.lat),
      longitude: Number(form.lng),
    },
    imageUrl: form.imageUrl.trim(),
    localizations,
  };
}

function langLabel(lang: LangKey): string {
  return LANGS.find((l) => l.key === lang)?.label ?? lang;
}

/** 追加失敗の例外をユーザー向け文言に変換する（Backend の生メッセージは出さない）。 */
function saveErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.violations.length > 0) {
      return "入力内容に誤りがあります。各項目を確認してください。";
    }
    return "スポットの追加に失敗しました。時間をおいて再度お試しください。";
  }
  if (isNetworkError(error)) {
    return error.message;
  }
  return "スポットの追加に失敗しました。時間をおいて再度お試しください。";
}
