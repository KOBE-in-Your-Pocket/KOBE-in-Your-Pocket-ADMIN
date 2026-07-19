/** Backend JWT `app_metadata.role` と対応（Supabase 側で付与）。 */
export type Role = "operator" | "admin";

export function isRole(value: string | null | undefined): value is Role {
  return value === "operator" || value === "admin";
}
