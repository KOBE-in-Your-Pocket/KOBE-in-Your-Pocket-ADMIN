/**
 * ダッシュボード feature の API シーム。Phase 4（統計）で実 API 化。
 *
 * 現状は mock 固定データを同期で返す。実 API 接続時はこの getter の中身だけを
 * fetch へ差し替えれば、画面側は変更不要。
 */
import {
  MOCK_POPULAR_SPOTS,
  MOCK_RECENT_ACTIONS,
  MOCK_STATS,
} from "./mock-dashboard";
import type { PopularSpot, RecentAction, Stat } from "./mock-dashboard";

export type { PopularSpot, RecentAction, Stat, StatKey } from "./mock-dashboard";

/** 指標カードの値を取得する（mock）。 */
export function getStats(): Stat[] {
  return MOCK_STATS;
}

/** 人気スポット Top5 を取得する（mock）。 */
export function getPopularSpots(): PopularSpot[] {
  return MOCK_POPULAR_SPOTS;
}

/** 直近の操作ログを取得する（mock）。 */
export function getRecentActions(): RecentAction[] {
  return MOCK_RECENT_ACTIONS;
}
