/**
 * ジャンル feature の API（Backend #153）。
 *
 * ```
 * GET    /api/v1/tourism/genres          公開。全言語のラベルとスポット件数を返す
 * POST   /api/v1/tourism/genres          OPERATOR 以上
 * PUT    /api/v1/tourism/genres/{code}   OPERATOR 以上
 * DELETE /api/v1/tourism/genres/{code}   OPERATOR 以上。使用中は 409
 * ```
 *
 * 表示名は `?lang=` で 1 言語に解決せず、全言語まとめて返る。編集フォームが全言語を
 * 必要とするため、スポット詳細のような言語ごとの並行取得（`fetchSpotDetail`）が要らない。
 */
import { apiRequest } from "../../../api";
import { LANG_KEYS, type Genre, type GenreInput } from "../../../types";

const GENRES_PATH = "/api/v1/tourism/genres";

/** Backend の `GenreResponse`。`labels` は言語コード → 表示名。 */
type GenreResponse = {
  code: string;
  displayOrder: number;
  labels: Record<string, string>;
  /** 一覧のみ。登録・更新の応答では null。 */
  spotCount: number | null;
};

/**
 * ジャンル一覧を取得する。
 *
 * 並びは Backend が `display_order` → `code` で返す。ADMIN で並べ替えないのは、
 * Client のジャンルフィルタに出る順序をそのまま運営に見せるため。
 */
export async function fetchGenres(): Promise<Genre[]> {
  const responses = await apiRequest<GenreResponse[]>(GENRES_PATH);
  return responses.map(toGenre);
}

/**
 * ジャンルを追加する。
 *
 * `code` は Backend が `labels.en` から採番する。既存と衝突した場合は 409 ではなく
 * `night-view-2` のように連番が付く（同じ英語名の別ジャンルを作ること自体は正当な操作で、
 * ID の衝突は Backend の内部事情、という判断）。**採番結果は応答で確定する**ため、
 * ADMIN 側で事前に予測して見せない。
 *
 * 英語表示名から slug を作れない（記号だけ等）場合は 400。
 */
export function createGenre(input: GenreInput): Promise<Genre> {
  return apiRequest<GenreResponse>(GENRES_PATH, {
    method: "POST",
    json: input,
  }).then(toGenre);
}

/**
 * ジャンルを更新する（全置換）。変更できるのは表示名と並び順のみ。
 *
 * `code` はパスの値がそのまま使われ、英語表示名を変えても追従しない。
 * `displayOrder` を省くと Backend の既定値 0 に落ちるため、取得した値を必ず送る。
 */
export function updateGenre(code: string, input: GenreInput): Promise<Genre> {
  return apiRequest<GenreResponse>(
    `${GENRES_PATH}/${encodeURIComponent(code)}`,
    { method: "PUT", json: input },
  ).then(toGenre);
}

/**
 * ジャンルを削除する。成功時は 204（ボディ無し）。
 *
 * **スポットから参照されている場合は 409**。運営は先にスポットのジャンルを付け替える。
 */
export function deleteGenre(code: string): Promise<void> {
  return apiRequest<void>(`${GENRES_PATH}/${encodeURIComponent(code)}`, {
    method: "DELETE",
  });
}

/**
 * 応答を画面が扱う形にする。
 *
 * `labels` を対応言語ぶんの固定キーに詰め直す。Backend は全言語を返す不変条件
 * （`GenreLocalizations`）を持つが、欠けた言語があっても画面を壊さず空欄として見せる。
 */
function toGenre(response: GenreResponse): Genre {
  return {
    code: response.code,
    displayOrder: response.displayOrder,
    labels: Object.fromEntries(
      LANG_KEYS.map((lang) => [lang, response.labels[lang] ?? ""]),
    ) as Genre["labels"],
    spotCount: response.spotCount,
  };
}

/** 全対応言語ぶんの空ラベル。フォームの初期値に使う。 */
export function emptyLabels(): Genre["labels"] {
  return Object.fromEntries(
    LANG_KEYS.map((lang) => [lang, ""]),
  ) as Genre["labels"];
}

/**
 * English の表示名から code を作れるか（Backend `GenreCode.fromLabel` と同じ判定）。
 *
 * Backend は英数字以外を区切りとして slug にするため、半角英数字が 1 文字も無いと
 * 生成できず 400 になる。**採番結果そのものは予測しない**（衝突時の連番は Backend が
 * 決める）が、この 1 点だけは入力中に分かるので往復せずその場で伝える。
 */
export function canDeriveGenreCode(en: string): boolean {
  return /[a-z0-9]/.test(en.toLowerCase());
}
