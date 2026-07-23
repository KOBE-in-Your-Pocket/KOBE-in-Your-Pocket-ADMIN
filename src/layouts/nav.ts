import { ROUTES } from "../routes/paths";

export type NavItem = {
  key: string;
  path: string;
  label: string;
  /** ラベル横の補足表示。 */
  suffix?: string;
  /** サイドバーアイコンの SVG path。 */
  icon: string;
  /** admin ロールのみ表示。 */
  adminOnly?: boolean;
};

/** サイドバーのナビ項目（ADMIN-image shared/config/nav.ts 準拠）。 */
export const NAV_ITEMS: NavItem[] = [
  {
    key: "dashboard",
    path: ROUTES.dashboard,
    label: "ダッシュボード",
    icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  },
  {
    key: "spots",
    path: ROUTES.spots,
    label: "スポット",
    icon: "M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  },
  {
    key: "reviews",
    path: ROUTES.reviews,
    label: "レビュー",
    icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  },
  {
    key: "manner",
    path: ROUTES.manner,
    label: "マナー",
    icon: "M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z M9 12l2 2 4-4",
  },
  {
    key: "shelter",
    path: ROUTES.shelter,
    label: "避難所",
    icon: "M3 11l9-8 9 8 M5 10v10h14V10",
  },
  {
    key: "genre",
    path: ROUTES.genre,
    label: "ジャンル",
    icon: "M20.6 13.4 12 22l-9-9V3h9z M7 7h.01",
  },
  {
    key: "users",
    path: ROUTES.users,
    label: "ユーザー",
    icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87",
  },
  {
    key: "stats",
    path: ROUTES.stats,
    label: "統計",
    suffix: "（Phase 4）",
    icon: "M4 20V4 M4 20h16 M8 20v-6 M13 20v-10 M18 20v-4",
  },
  {
    key: "logs",
    path: ROUTES.logs,
    label: "操作ログ",
    suffix: "（adminのみ）",
    adminOnly: true,
    icon: "M14 3v4h4 M14 3H6v18h12V7z M9 12h6 M9 16h6",
  },
];

/** パンくず表示。ルートパス単位で対応（ADMIN-image getCrumb 準拠）。 */
const CRUMBS: Record<string, string> = {
  [ROUTES.dashboard]: "ホーム / ダッシュボード",
  [ROUTES.spots]: "ホーム / スポット",
  [ROUTES.spotNew]: "ホーム / スポット / 新規追加",
  [ROUTES.users]: "ホーム / ユーザー",
  [ROUTES.reviews]: "ホーム / レビュー",
  [ROUTES.manner]: "ホーム / マナー",
  [ROUTES.shelter]: "ホーム / 避難所",
  [ROUTES.genre]: "ホーム / ジャンル",
  [ROUTES.stats]: "ホーム / 統計",
  [ROUTES.logs]: "ホーム / 操作ログ",
};

/** パンくずを解決する。スポット編集は ID を含むため個別に判定する。 */
export function getCrumb(pathname: string): string {
  if (/^\/spots\/[^/]+\/edit$/.test(pathname)) return "ホーム / スポット / 編集";
  return CRUMBS[pathname] ?? "ホーム";
}
