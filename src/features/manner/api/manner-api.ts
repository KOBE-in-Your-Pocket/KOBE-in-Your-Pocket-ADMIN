/**
 * マナー feature の API（Backend M-1）。
 *
 * ```
 * GET    /api/v1/manner/items        公開。Client も使う
 * POST   /api/v1/manner/items        OPERATOR 以上
 * PUT    /api/v1/manner/items/{id}   OPERATOR 以上。全置換
 * DELETE /api/v1/manner/items/{id}   OPERATOR 以上
 * ```
 *
 * 一覧は `?lang=` で 1 言語に解決した `title` / `description` に加え、全言語ぶんの
 * `localizations` も返す。ADMIN は後者しか使わないため **lang を指定しない**
 * （Backend は en へフォールバックし、その結果は捨てられる）。編集フォームが全言語を
 * 必要とするので、ジャンルマスタと同じく言語ごとの取り直しは要らない。
 */
import { apiRequest } from "../../../api";
import {
  LANG_KEYS,
  type MannerItemDetail,
  type MannerItemInput,
  type MannerKind,
  type MannerScope,
} from "../../../types";

const MANNER_ITEMS_PATH = "/api/v1/manner/items";

/** Backend の `MannerItemResponse`。 */
type MannerItemResponse = {
  id: string;
  /** 要求言語で解決済みの文言。ADMIN は `localizations` を使うため参照しない。 */
  title: string;
  description: string;
  /** アイコン識別キー。画像 URL だけの項目では null。 */
  icon: string | null;
  /** アップロード済みアイコン画像の URL。未設定なら null。 */
  iconUrl: string | null;
  kind: string;
  scope: string;
  relatedSpotIds: string[];
  /** 言語コード → 文言。 */
  localizations: Record<string, { title: string; description: string }>;
};

/** 登録・更新のリクエスト（Backend `MannerItemRequest`）。**`id` は送らない**。 */
type MannerItemRequestBody = {
  icon: string | null;
  iconUrl: string | null;
  kind: MannerKind;
  scope: MannerScope;
  relatedSpotIds: string[];
  localizations: MannerItemDetail["localizations"];
};

/**
 * マナー項目の一覧を取得する。
 *
 * 並びは Backend が `id` 順で返す。ADMIN で並べ替えないのは、ジャンルと同じく
 * サーバーが決めた順序をそのまま運営に見せるため（画面側でフィルタと検索は掛ける）。
 */
export async function fetchMannerItems(): Promise<MannerItemDetail[]> {
  const responses = await apiRequest<MannerItemResponse[]>(MANNER_ITEMS_PATH);
  return responses.map(toMannerItemDetail);
}

/**
 * マナー項目を追加する。
 *
 * `id` は Backend が英語タイトルの slug から採番する（`MannerItem.Id.fromTitle`）。
 * 既存と衝突した場合は 409 ではなく `no-littering-2` のように連番が付く。
 * **採番結果は応答で確定する**ため、ADMIN 側で事前に予測して見せない（ジャンルと同じ）。
 *
 * 英語タイトルから slug を作れない（記号だけ等）場合は 400。この 1 点だけは入力中に
 * 分かるので、フォームが [toMannerId] で往復前に弾く。
 *
 * アイコン画像は staging の URL を送る。Backend が保存と同時に確定させる
 * （`RegisterMannerItemService` の `MediaStorage.commit`）ので、ADMIN 側の確定操作は不要。
 */
export function createMannerItem(
  input: MannerItemInput,
): Promise<MannerItemDetail> {
  return apiRequest<MannerItemResponse>(MANNER_ITEMS_PATH, {
    method: "POST",
    json: toRequestBody(input),
  }).then(toMannerItemDetail);
}

/**
 * マナー項目を更新する（全置換）。
 *
 * `id` はパスの値がそのまま使われ、英語タイトルを変えても追従しない。Client が項目詳細
 * （`/manner/[id]`）の遷移先に使っており、変えると既存のリンクが切れるため。
 */
export function updateMannerItem(
  id: string,
  input: MannerItemInput,
): Promise<MannerItemDetail> {
  return apiRequest<MannerItemResponse>(
    `${MANNER_ITEMS_PATH}/${encodeURIComponent(id)}`,
    { method: "PUT", json: toRequestBody(input) },
  ).then(toMannerItemDetail);
}

/**
 * マナー項目を削除する。成功時は 204（ボディ無し）。
 *
 * 関連スポットとローカライズは DB の ON DELETE CASCADE で連動削除されるため、
 * ジャンルの 409 のような「参照されていると消せない」制約は無い。
 */
export function deleteMannerItem(id: string): Promise<void> {
  return apiRequest<void>(`${MANNER_ITEMS_PATH}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/**
 * 応答を画面が扱う形にする。
 *
 * `kind` / `scope` は Backend の CHECK 制約（V5）と VO で閉じた集合のため、そのまま
 * リテラル型として扱う。`localizations` は対応言語ぶんの固定キーに詰め直し、欠けた言語が
 * あっても画面を壊さず空欄として見せる（ジャンルの `toGenre` と同じ方針）。
 */
function toMannerItemDetail(response: MannerItemResponse): MannerItemDetail {
  return {
    id: response.id,
    // 画像だけで登録された項目は icon が null。画面は「キー未設定」を空文字で扱う。
    icon: response.icon ?? "",
    iconUrl: response.iconUrl,
    kind: response.kind as MannerKind,
    scope: response.scope as MannerScope,
    relatedSpotIds: response.relatedSpotIds,
    localizations: Object.fromEntries(
      LANG_KEYS.map((lang) => [
        lang,
        response.localizations[lang] ?? { title: "", description: "" },
      ]),
    ) as MannerItemDetail["localizations"],
  };
}

/**
 * 登録・更新のリクエストボディを組み立てる。
 *
 * 空文字のアイコンキーは null で送る。Backend も blank を null 扱いするが、
 * 「未設定」であることをボディの時点で明示する。
 */
function toRequestBody(input: MannerItemInput): MannerItemRequestBody {
  return {
    icon: input.icon === "" ? null : input.icon,
    iconUrl: input.iconUrl,
    kind: input.kind,
    scope: input.scope,
    relatedSpotIds: input.relatedSpotIds,
    localizations: input.localizations,
  };
}

/** 全対応言語ぶんの空欄。フォームの初期値に使う。 */
export function emptyLocalizations(): MannerItemDetail["localizations"] {
  return Object.fromEntries(
    LANG_KEYS.map((lang) => [lang, { title: "", description: "" }]),
  ) as MannerItemDetail["localizations"];
}

/**
 * 英語タイトルから ID の slug を作る（`No littering` → `no-littering`）。
 *
 * Backend の `MannerItem.Id.fromTitle` と同じ規則。**実際の ID は Backend が採番する**ので
 * これは入力チェック専用で、空文字を返す＝ slug を作れない＝ 400 になる入力、という判定に使う
 * （衝突時の連番は予測しない）。
 */
export function toMannerId(englishTitle: string): string {
  return englishTitle
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
