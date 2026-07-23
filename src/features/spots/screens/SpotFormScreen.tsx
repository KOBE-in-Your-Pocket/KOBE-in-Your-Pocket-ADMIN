import { useId, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button, UploadIcon } from "../../../components";
import { ROUTES } from "../../../routes/paths";
import type { LangKey, Localized } from "../../../types";
import {
  GENRE_LABELS,
  GENRES,
  LANGS,
  MOCK_SPOTS,
  type Genre,
} from "../mock-spots";
import styles from "./SpotFormScreen.module.css";

const EMPTY_LOCALIZED: Localized<string> = { ja: "", en: "", zh: "", ko: "" };

/** 神戸市中心部の座標。新規追加時の初期値。 */
const DEFAULT_COORD = { lat: "34.6937", lng: "135.1955" };

type SpotForm = {
  name: Localized<string>;
  desc: Localized<string>;
  addr: Localized<string>;
  genre: Genre;
  lat: string;
  lng: string;
};

export function SpotFormScreen() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = id !== undefined;
  const editing = isEdit ? MOCK_SPOTS.find((s) => s.id === id) : undefined;

  const genreId = useId();
  const latId = useId();
  const lngId = useId();
  const nameId = useId();
  const descId = useId();
  const addrId = useId();

  const [langTab, setLangTab] = useState<LangKey>("ja");
  const [form, setForm] = useState<SpotForm>(() => ({
    // 編集時は一覧が持つ値のみ復元できる。説明・住所は API 未接続のため空。
    name: editing ? { ...EMPTY_LOCALIZED, ja: editing.name } : EMPTY_LOCALIZED,
    desc: EMPTY_LOCALIZED,
    addr: EMPTY_LOCALIZED,
    genre: editing?.genre ?? "landmark",
    lat: editing?.lat ?? DEFAULT_COORD.lat,
    lng: editing?.lng ?? DEFAULT_COORD.lng,
  }));

  // 存在しない ID の編集は一覧へ戻す
  if (isEdit && !editing) return <Navigate to={ROUTES.spots} replace />;

  const setLocalized = (field: "name" | "desc" | "addr", value: string) =>
    setForm((prev) => ({
      ...prev,
      [field]: { ...prev[field], [langTab]: value },
    }));

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isEdit ? "スポットを編集" : "スポットを追加"}
        </h1>
        <div className={styles.headerButtons}>
          <Button variant="secondary" onClick={() => navigate(ROUTES.spots)}>
            キャンセル
          </Button>
          {/* API 未接続のため、保存せず一覧に戻る（実 API は #33 / 編集 #152） */}
          <Button onClick={() => navigate(ROUTES.spots)}>保存</Button>
        </div>
      </div>

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
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, lng: e.target.value }))
                }
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>画像</span>
              <div className={styles.dropzone}>
                <UploadIcon size={30} />
                <div className={styles.dropzoneText}>
                  画像をドラッグ＆ドロップ
                  <br />
                  または
                </div>
                {/* mock のため未実装 */}
                <button type="button" className={styles.dropzoneButton}>
                  ファイルを選択
                </button>
              </div>
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
              <label className={styles.label} htmlFor={descId}>
                説明（description）
              </label>
              <textarea
                id={descId}
                className={styles.textarea}
                value={form.desc[langTab]}
                onChange={(e) => setLocalized("desc", e.target.value)}
                placeholder="説明を入力"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={addrId}>
                住所（address）
              </label>
              <input
                id={addrId}
                className={styles.input}
                value={form.addr[langTab]}
                onChange={(e) => setLocalized("addr", e.target.value)}
                placeholder="住所を入力"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
