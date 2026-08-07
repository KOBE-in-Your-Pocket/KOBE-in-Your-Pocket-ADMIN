/**
 * ユーザーロール。
 *
 * 正は Supabase JWT の `app_metadata.role` カスタムクレーム。
 * Backend `domain/user/vo/Role`（general / operator / admin）と一致させる。
 */
export const ROLES = ["general", "operator", "admin"] as const;

export type Role = (typeof ROLES)[number];

/** 管理画面にログインできるロール。`general` は対象外。 */
export const ADMIN_CONSOLE_ROLES = ["operator", "admin"] as const;

export type AdminConsoleRole = (typeof ADMIN_CONSOLE_ROLES)[number];

export function isRole(value: string | null | undefined): value is Role {
  return ROLES.includes(value as Role);
}

/** 管理画面の利用可否。ルートガードの入口判定に使う。 */
export function isAdminConsoleRole(
  value: string | null | undefined,
): value is AdminConsoleRole {
  return ADMIN_CONSOLE_ROLES.includes(value as AdminConsoleRole);
}
