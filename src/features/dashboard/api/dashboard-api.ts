/**
 * ダッシュボード feature の API。
 *
 * 集計は Backend の統計 API（`GET /api/v1/stats` / Backend #169）に接続済み。
 * 以前は統計 API が無く mock 固定データを返していたが、一覧 API をフロントで
 * 集計する方式は 1 リクエスト 200 件の上限で部分集計にしかならないため、
 * 集計そのものを Backend へ寄せている。
 */
import { apiRequest } from "../../../api";
import type { DashboardStats } from "../../../types";

const STATS_PATH = "/api/v1/stats";

/** 管理画面の表示言語。人気スポット・直近レビューの**スポット名の解決にのみ**効く。 */
const LIST_LANG = "ja";

/**
 * ダッシュボードの集計を取得する（GET /api/v1/stats）。
 *
 * Backend は運営ロール限定（`hasRole('OPERATOR')`、ロール階層で admin も通る）。
 * 総数・今月/先月の件数・人気スポット Top5・直近レビュー 5 件が 1 リクエストで返る。
 */
export function fetchDashboardStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>(`${STATS_PATH}?lang=${LIST_LANG}`);
}
