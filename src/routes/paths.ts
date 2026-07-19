export const ROUTES = {
  login: "/login",
  dashboard: "/",
  forbidden: "/403",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** 開発ビルドでのみ有効なルート。 */
export const DEV_ROUTES = {
  /** 汎用 UI の目視確認用ギャラリー。 */
  uiGallery: "/dev/ui",
} as const;
