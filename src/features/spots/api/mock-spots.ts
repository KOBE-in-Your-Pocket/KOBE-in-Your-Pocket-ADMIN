import type { LangKey } from "../../../types";

/**
 * スポット管理の mock 固定データと定数。
 *
 * 画面は直接 import せず、`spots-api` の `listSpots()` / `getSpot()` 経由で参照する。
 * 実 API 接続は #32（一覧）/ #33（追加）、Backend のスポット編集は #152。
 */

export type Genre = "landmark" | "nature" | "history" | "gourmet" | "onsen";

/** ジャンルの日本語表示。 */
export const GENRE_LABELS: Record<Genre, string> = {
  landmark: "名所",
  nature: "自然",
  history: "歴史",
  gourmet: "グルメ",
  onsen: "温泉",
};

export const GENRES = Object.keys(GENRE_LABELS) as Genre[];

/** 言語タブのラベル。 */
export const LANGS: { key: LangKey; label: string }[] = [
  { key: "ja", label: "日本語" },
  { key: "en", label: "English" },
  { key: "zh", label: "中文" },
  { key: "ko", label: "한국어" },
];

/** 一覧・フォームが表示する mock スポット。 */
export type MockSpot = {
  id: string;
  name: string;
  genre: Genre;
  lat: string;
  lng: string;
  date: string;
  /** サムネイルのアイコン色 */
  color: string;
  /** サムネイルの背景色 */
  tint: string;
};

export const MOCK_SPOTS: MockSpot[] = [
  { id: "1", name: "神戸ポートタワー", genre: "landmark", lat: "34.6937", lng: "135.1955", date: "2024/05/01", color: "#E11D48", tint: "#FCE7EA" },
  { id: "2", name: "六甲山", genre: "nature", lat: "34.7884", lng: "135.2622", date: "2024/05/02", color: "#2E7D32", tint: "#E4F1E5" },
  { id: "3", name: "北野異人館街", genre: "history", lat: "34.7011", lng: "135.1897", date: "2024/05/03", color: "#B45309", tint: "#F6ECDE" },
  { id: "4", name: "神戸牛ステーキ", genre: "gourmet", lat: "34.6976", lng: "135.1929", date: "2024/05/04", color: "#DC2626", tint: "#FBE5E5" },
  { id: "5", name: "有馬温泉", genre: "onsen", lat: "34.7955", lng: "135.2481", date: "2024/05/05", color: "#0E7C86", tint: "#DEF0F1" },
  { id: "6", name: "メリケンパーク", genre: "landmark", lat: "34.6820", lng: "135.1870", date: "2024/05/06", color: "#F39C12", tint: "#FEF1E0" },
  { id: "7", name: "須磨海岸", genre: "nature", lat: "34.6431", lng: "135.1263", date: "2024/05/07", color: "#2E7D32", tint: "#E4F1E5" },
  { id: "8", name: "生田神社", genre: "history", lat: "34.6949", lng: "135.1900", date: "2024/05/08", color: "#B45309", tint: "#F6ECDE" },
  { id: "9", name: "南京町（中華街）", genre: "gourmet", lat: "34.6889", lng: "135.1875", date: "2024/05/09", color: "#DC2626", tint: "#FBE5E5" },
  { id: "10", name: "布引の滝", genre: "nature", lat: "34.7076", lng: "135.1978", date: "2024/05/10", color: "#2E7D32", tint: "#E4F1E5" },
  { id: "11", name: "兵庫県立美術館", genre: "landmark", lat: "34.7003", lng: "135.2213", date: "2024/05/11", color: "#F39C12", tint: "#FEF1E0" },
  { id: "12", name: "湊川神社", genre: "history", lat: "34.6829", lng: "135.1791", date: "2024/05/12", color: "#B45309", tint: "#F6ECDE" },
];
