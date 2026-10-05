import { ROUTES } from "../../routes/paths";
import type { Role } from "../../types/role";

/**
 * ロールごとのログイン後の遷移先。admin はダッシュボード、それ以外はスポット。
 *
 * 以前は mock 画面を出さないビルドでダッシュボードが「準備中」になるため一律スポットへ
 * 着地させていたが、ダッシュボードを常時表示にしたのでロールどおりに振り分ける。
 */
export function landingPath(role: Role): string {
  return role === "admin" ? ROUTES.dashboard : ROUTES.spots;
}
