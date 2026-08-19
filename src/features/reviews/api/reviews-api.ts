/**
 * レビュー feature の API。
 *
 * 運営向けの横断一覧・モデレーション削除（Backend #165）に接続済み。
 * Client 向けの公開 API（`/spots/{spotId}/reviews`）とは別の名前空間。
 */
import { apiRequest } from "../../../api";
import type { ReviewListResponse } from "../../../types";

const REVIEWS_PATH = "/api/v1/tourism/reviews";

/** 管理画面の表示言語。スポット名の解決にのみ効く（レビュー本文は投稿言語のまま返る）。 */
const LIST_LANG = "ja";

/**
 * 1 リクエストで取得する上限。Backend の `ListAllReviewsService.MAX_SIZE` と同値。
 *
 * これを超える指定は Backend 側で丸められるため、ここで超えても無駄になる。
 */
const MAX_PAGE_SIZE = 200;

/** 評価フィルタの選択肢（★5 → ★1）。Backend の rating は 1〜5 の整数。 */
export const RATINGS = [5, 4, 3, 2, 1];

/**
 * レビューを全スポット横断で取得する（GET /api/v1/tourism/reviews）。
 *
 * Backend はページングに対応しているが、**検索・絞り込み API が無い**ため画面側で
 * スポット・評価・キーワードのフィルタを掛けている。サーバーページングにすると
 * 「表示中のページ内だけ絞り込み」になってしまうので、上限まで一括取得する
 * （ユーザー一覧・スポット一覧と同じ方針）。
 *
 * 総数が [MAX_PAGE_SIZE] を超えると 2 ページ目以降が画面に出ない。レビューは
 * 一般ユーザーが投稿する分だけ件数が伸びやすいため、`meta.totalElements` を見て
 * サーバー絞り込みへ切り替える判断が要る。
 */
export function fetchReviews(): Promise<ReviewListResponse> {
  return apiRequest<ReviewListResponse>(
    `${REVIEWS_PATH}?lang=${LIST_LANG}&size=${MAX_PAGE_SIZE}`,
  );
}

/**
 * レビューを削除する（DELETE /api/v1/tourism/reviews/{reviewId}）。
 *
 * Backend は運営ロール限定のモデレーション削除で、**投稿者本人かどうかは問わない**。
 * 成功時は 204（ボディ無し）。
 */
export function deleteReview(id: string): Promise<void> {
  return apiRequest<void>(`${REVIEWS_PATH}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
