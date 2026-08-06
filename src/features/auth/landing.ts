import { SHOW_MOCK_SCREENS } from "../../lib/feature-flags";
import { ROUTES } from "../../routes/paths";
import type { Role } from "../../types/role";

/**
 * ロールごとのログイン後の遷移先。admin はダッシュボード、それ以外はスポット。
 *
 * ただし mock 画面を出さないビルド（デモ・本番）ではダッシュボードが準備中になるため、
 * ロールを問わず、実 API に繋がっているスポットへ着地させる。
 */
export function landingPath(role: Role): string {
  if (!SHOW_MOCK_SCREENS) return ROUTES.spots;
  return role === "admin" ? ROUTES.dashboard : ROUTES.spots;
}
