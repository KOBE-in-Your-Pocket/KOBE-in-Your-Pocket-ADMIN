/**
 * ジャンル feature の API シーム。**現状は mock（メモリ保持）**。
 *
 * Backend にジャンルマスタと管理 API がまだ無い（Backend #153）。スポットの `genre` は
 * VARCHAR の文字列で、表示名は ADMIN と Client がそれぞれハードコードしている。
 *
 * 実 API ができたら、この 4 関数の中身を `apiRequest` に差し替えるだけで画面は変更不要。
 * 想定しているエンドポイントは次の形（Backend #153 の案）。
 *
 * ```
 * GET    /api/v1/tourism/genres
 * POST   /api/v1/tourism/genres
 * PUT    /api/v1/tourism/genres/{code}
 * DELETE /api/v1/tourism/genres/{code}
 * ```
 */
import { LANG_KEYS, type Genre, type GenreInput } from "../../../types";

/** mock が模すネットワーク遅延（ミリ秒）。読み込み表示の確認用。 */
const MOCK_LATENCY_MS = 250;

/**
 * 初期データ。**本番のスポット 15 件が実際に使っている 5 種**に合わせている。
 *
 * 日本語ラベルは ADMIN の `GENRE_LABELS`、他言語はスポットの `category.label` の
 * 実データ（例: onsen → Hot Spring / 온천）に寄せた。
 */
const INITIAL_GENRES: Genre[] = [
  {
    code: "landmark",
    labels: { ja: "名所", en: "Landmark", ko: "명소", zh: "名胜" },
  },
  {
    code: "nature",
    labels: { ja: "自然", en: "Nature", ko: "자연", zh: "自然" },
  },
  {
    code: "history",
    labels: { ja: "歴史", en: "History", ko: "역사", zh: "历史" },
  },
  {
    code: "gourmet",
    labels: { ja: "グルメ", en: "Gourmet", ko: "미식", zh: "美食" },
  },
  {
    code: "onsen",
    labels: { ja: "温泉", en: "Hot Spring", ko: "온천", zh: "温泉" },
  },
];

/**
 * mock の保持先。モジュールスコープのため**リロードで初期値に戻る**。
 *
 * 実 API 化までの暫定。追加・編集・削除が一覧に反映される様子を確認できるようにする。
 */
let genres: Genre[] = INITIAL_GENRES.map(clone);

function clone(genre: Genre): Genre {
  return { code: genre.code, labels: { ...genre.labels } };
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
}

/** ジャンルの並び順。運営が探しやすいよう code の昇順で安定させる。 */
function sortByCode(list: Genre[]): Genre[] {
  return [...list].sort((a, b) => a.code.localeCompare(b.code));
}

/** ジャンル一覧を取得する（mock）。 */
export async function fetchGenres(): Promise<Genre[]> {
  await delay();
  return sortByCode(genres).map(clone);
}

/**
 * ジャンルを追加する（mock）。
 *
 * `code` は **Backend が英語表示名の slug から決める**（Backend #153）ため、リクエストには
 * 含めず、ここでも `toGenreCode` で同じ規則を再現する。実 API 化後はレスポンスの
 * `code` をそのまま使う。
 *
 * slug が既存と衝突すると、その値を参照している既存スポットのジャンルがどちらを
 * 指すか決まらなくなる。ここで弾く。
 */
export async function createGenre(input: GenreInput): Promise<Genre> {
  await delay();
  const code = toGenreCode(input.labels.en);
  if (code === "") {
    throw new Error(
      "英語の表示名からコードを作れませんでした。半角英数字を含めてください。",
    );
  }
  if (genres.some((g) => g.code === code)) {
    throw new Error(`コード「${code}」のジャンルは既に登録されています。`);
  }
  const created: Genre = { code, labels: { ...input.labels } };
  genres = [...genres, created];
  return clone(created);
}

/**
 * ジャンルの表示名を更新する（mock）。
 *
 * `code` は既存スポットが参照する識別子のため、英語表示名を編集しても変わらない。
 * コードを変えたい場合は新しく作り直し、スポット側を付け替える運用になる。
 */
export async function updateGenre(
  code: string,
  labels: Genre["labels"],
): Promise<Genre> {
  await delay();
  const target = genres.find((g) => g.code === code);
  if (!target) {
    throw new Error("対象のジャンルが見つかりませんでした。");
  }
  const updated: Genre = { code, labels: { ...labels } };
  genres = genres.map((g) => (g.code === code ? updated : g));
  return clone(updated);
}

/** ジャンルを削除する（mock）。 */
export async function deleteGenre(code: string): Promise<void> {
  await delay();
  if (!genres.some((g) => g.code === code)) {
    throw new Error("対象のジャンルが見つかりませんでした。");
  }
  genres = genres.filter((g) => g.code !== code);
}

/** 全対応言語ぶんの空ラベル。フォームの初期値に使う。 */
export function emptyLabels(): Genre["labels"] {
  return Object.fromEntries(
    LANG_KEYS.map((lang) => [lang, ""]),
  ) as Genre["labels"];
}

/**
 * 英語表示名から `code` を作る。Backend の採番規則（Backend #153）に合わせる。
 *
 * 実 API では Backend が決めた値が正だが、フォームで「このコードになります」と
 * 事前に見せ、重複も送信前に気付けるようにするため ADMIN 側でも同じ規則を持つ。
 *
 * 例: `Hot Spring` → `hot-spring`、`Cafe & Bar` → `cafe-bar`
 */
export function toGenreCode(en: string): string {
  return en
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
