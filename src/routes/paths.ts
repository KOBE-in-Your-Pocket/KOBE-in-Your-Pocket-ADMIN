/**
 * アプリの静的ルートパス。ADMIN-image と同等の構成。
 *
 * 動的パス（スポット編集）は [spotEditPath] を使う。
 */
export const ROUTES = {
  login: "/login",
  dashboard: "/",
  spots: "/spots",
  spotNew: "/spots/new",
  reviews: "/reviews",
  users: "/users",
  manner: "/manner",
  shelter: "/shelter",
  genre: "/genre",
  stats: "/stats",
  /** admin のみ。 */
  logs: "/logs",
  forbidden: "/403",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** スポット編集画面のパスを ID から組み立てる。 */
export function spotEditPath(id: string): string {
  return `/spots/${id}/edit`;
}

/** ルート定義に渡すパスパターン（`createBrowserRouter` の path 用）。 */
export const ROUTE_PATTERNS = {
  spotEdit: "/spots/:id/edit",
} as const;

/** 開発ビルドでのみ有効なルート。 */
export const DEV_ROUTES = {
  /** 汎用 UI の目視確認用ギャラリー。 */
  uiGallery: "/dev/ui",
} as const;
