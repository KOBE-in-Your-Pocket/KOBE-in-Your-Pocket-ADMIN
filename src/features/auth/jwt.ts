import { isRole, type Role } from "../../types/role";

/**
 * アクセストークン（Supabase JWT）からロールを解決する。
 *
 * 正は `app_metadata.role` カスタムクレーム（Backend `SupabaseJwtAuthenticationConverter`
 * と一致）。未設定・未対応・不正トークンは一般ユーザー（`general`）扱いにする。
 *
 * 署名検証はしない（正当性は毎リクエスト Backend が検証する）。ここでは表示・
 * 認可分岐に使うクレームの読み取りのみを行う。
 */
export function roleFromAccessToken(token: string | null): Role {
  const payload = token !== null ? decodeJwtPayload(token) : null;
  const appMetadata = payload?.["app_metadata"];
  const role = isRecord(appMetadata) ? appMetadata["role"] : undefined;
  return typeof role === "string" && isRole(role) ? role : "general";
}

/** JWT の payload 部（2番目のセグメント）を JSON として復号する。失敗時は null。 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const segment = token.split(".")[1];
  if (segment === undefined || segment === "") return null;

  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    // マルチバイトクレーム（名前・メール等）でも壊れないよう UTF-8 で復号する。
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const parsed: unknown = JSON.parse(json);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
