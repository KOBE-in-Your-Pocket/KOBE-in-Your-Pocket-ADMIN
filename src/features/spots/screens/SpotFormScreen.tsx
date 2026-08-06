import { useId, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isApiError, isNetworkError } from "../../../api";
import { Button, Spinner } from "../../../components";
import { ImageUploadField } from "../../media";
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
  type Genre,
  type SpotDetail,
} from "../api/spots-api";
import {
  useCreateSpot,
  useSpotDetail,
  useUpdateSpot,
} from "../hooks/useSpots";
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

/**
 * スポットの追加・編集画面。
 *
 * 編集時は保存に全言語が必要なため、フォームを描画する前に1件を全言語ぶん取得する
 * （取得できるまで入力させない）。取得後の初期値注入は [SpotFormBody] のマウントで行う。
 *
 * [SpotFormBody] には `key` に対象スポットの id を渡して、別スポットへ遷移したら
 * 必ず再マウントさせる。`initial` は useState の初期値としてしか読まれないため、
 * 遷移先の詳細がキャッシュ済み（＝ローディングを挟まず再描画される）だと、
 * state だけ前のスポットのまま `spotId` が入れ替わる。更新は全置換なので、
 * その状態で保存すると遷移先スポットの全言語データを前のスポットの内容で潰す。
 */
export function SpotFormScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = id !== undefined;
  const detail = useSpotDetail(id);

  if (!isEdit) {
    return <SpotFormBody mode="create" initial={emptyForm()} />;
  }

  if (detail.isLoading) {
    return (
      <>
        <FormHeaderSkeleton title="スポットを編集" />
        <div className={styles.panel}>
          <div className={styles.panelBody}>
            <div className={styles.loading} role="status">
              <Spinner label={null} />
              <span>読み込み中…</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (detail.isError || detail.data === undefined) {
    return (
      <>
        <FormHeaderSkeleton title="スポットを編集" />
        <div className={styles.panel}>
          <div className={styles.panelBody}>
            <div className={styles.error} role="alert">
              {loadErrorMessage(detail.error)}
            </div>
            <Button variant="secondary" onClick={() => navigate(ROUTES.spots)}>
              一覧へ戻る
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <SpotFormBody
      key={id}
      mode="edit"
      spotId={id}
      initial={toForm(detail.data)}
    />
  );
}

/** 読み込み中・エラー時にも同じ見出しを出すためのヘッダ。 */
function FormHeaderSkeleton({ title }: { title: string }) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
}

type SpotFormBodyProps = {
  mode: "create" | "edit";
  /** 編集時のみ必須。 */
  spotId?: string;
  initial: SpotForm;
};

function SpotFormBody({ mode, spotId, initial }: SpotFormBodyProps) {
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const createSpot = useCreateSpot();
  const updateSpot = useUpdateSpot(spotId ?? "");
  const saving = isEdit ? updateSpot : createSpot;

  const genreId = useId();
  const latId = useId();
  const lngId = useId();
  const nameId = useId();
  const categoryLabelId = useId();
  const descriptionId = useId();
  const businessHoursId = useId();
  const addressId = useId();

  const [langTab, setLangTab] = useState<LangKey>("ja");
  const [error, setError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [form, setForm] = useState<SpotForm>(initial);

  const setLocalized = (field: LocalizedField, value: string) =>
    setForm((prev) => ({
      ...prev,
      [field]: { ...prev[field], [langTab]: value },
    }));

  const onSave = () => {
    setError(null);
    const validationError = validate(form);
    if (validationError !== null) {
      setError(validationError);
      return;
    }
    saving.mutate(buildRequest(form), {
      onSuccess: () => navigate(ROUTES.spots),
      onError: (err) => setError(saveErrorMessage(err, mode)),
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
            disabled={saving.isPending}
          >
            キャンセル
          </Button>
          <Button
            onClick={onSave}
            loading={saving.isPending}
            disabled={imageUploading}
          >
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
              <ImageUploadField
                label="画像"
                value={form.imageUrl}
                onChange={(imageUrl) =>
                  setForm((prev) => ({ ...prev, imageUrl }))
                }
                onUploadingChange={setImageUploading}
                disabled={saving.isPending}
              />
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

/** 追加モードの初期フォーム。 */
function emptyForm(): SpotForm {
  return {
    name: EMPTY_LOCALIZED,
    categoryLabel: EMPTY_LOCALIZED,
    description: EMPTY_LOCALIZED,
    businessHours: EMPTY_LOCALIZED,
    address: EMPTY_LOCALIZED,
    genre: "landmark",
    lat: DEFAULT_COORD.lat,
    lng: DEFAULT_COORD.lng,
    imageUrl: "",
  };
}

/** 取得した詳細をフォームの初期値へ変換する。 */
function toForm(detail: SpotDetail): SpotForm {
  const pick = (field: LocalizedField): Localized<string> => {
    const value = {} as Localized<string>;
    for (const lang of LANG_KEYS) {
      value[lang] = detail.localizations[lang][field];
    }
    return value;
  };

  return {
    name: pick("name"),
    categoryLabel: pick("categoryLabel"),
    description: pick("description"),
    businessHours: pick("businessHours"),
    address: pick("address"),
    // Backend のジャンルは文字列。未知の値でも select が壊れないよう既定へ寄せる。
    genre: (GENRES as string[]).includes(detail.genre)
      ? (detail.genre as Genre)
      : "landmark",
    lat: String(detail.coordinates.latitude),
    lng: String(detail.coordinates.longitude),
    imageUrl: detail.imageUrl,
  };
}

/** 送信前のクライアント検証。問題があればユーザー向け文言、無ければ null。 */
function validate(form: SpotForm): string | null {
  if (form.imageUrl.trim() === "") {
    return "画像をアップロードしてください。";
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

/** フォームを Backend のリクエストへ変換する（追加・更新で同じ形）。 */
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

/** 編集対象の読み込み失敗をユーザー向け文言に変換する。 */
function loadErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 404) {
      return "このスポットは見つかりませんでした。削除された可能性があります。";
    }
    if (error.isUnauthorized) {
      return "ログインが必要です。再度ログインしてください。";
    }
    // 403 は再試行しても解決しないため、汎用の「時間をおいて」文言に落とさない。
    if (error.isForbidden) {
      return "このスポットを表示する権限がありません。";
    }
  }
  if (isNetworkError(error)) {
    return error.message;
  }
  return "スポットの取得に失敗しました。時間をおいて再度お試しください。";
}

/** 保存失敗の例外をユーザー向け文言に変換する（Backend の生メッセージは出さない）。 */
function saveErrorMessage(error: unknown, mode: "create" | "edit"): string {
  const action = mode === "edit" ? "更新" : "追加";
  const fallback = `スポットの${action}に失敗しました。時間をおいて再度お試しください。`;

  if (isApiError(error)) {
    // 未認証（セッション切れ等）。再ログインを促す。
    if (error.isUnauthorized) {
      return "ログインが必要です。再度ログインしてください。";
    }
    // 権限不足（operator 等が許可されない操作）。
    if (error.isForbidden) {
      return "この操作を行う権限がありません。";
    }
    // 編集中に対象が消えた場合（他の運営者が削除した等）。
    if (error.status === 404) {
      return "このスポットは見つかりませんでした。削除された可能性があります。";
    }
    if (error.violations.length > 0) {
      return "入力内容に誤りがあります。各項目を確認してください。";
    }
    return fallback;
  }
  if (isNetworkError(error)) {
    return error.message;
  }
  return fallback;
}
