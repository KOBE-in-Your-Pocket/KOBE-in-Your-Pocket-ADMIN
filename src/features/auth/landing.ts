import { ROUTES } from "../../routes/paths";
import type { Role } from "../../types/role";

/** ロールごとのログイン後の遷移先。admin はダッシュボード、それ以外はスポット。 */
export function landingPath(role: Role): string {
  return role === "admin" ? ROUTES.dashboard : ROUTES.spots;
}
