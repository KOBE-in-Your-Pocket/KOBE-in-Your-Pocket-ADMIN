import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "../api/dashboard-api";

/** ダッシュボード集計の query key。 */
export const dashboardStatsQueryKey = ["dashboard-stats"] as const;

/**
 * ダッシュボードの集計を取得する（GET /api/v1/stats）。
 *
 * 一覧画面のキャッシュとは独立させる。集計値は Backend が全件から計算しており、
 * 一覧（200 件上限）の内容から導けるものではないため、共有すると値がずれる。
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardStatsQueryKey,
    queryFn: fetchDashboardStats,
  });
}
