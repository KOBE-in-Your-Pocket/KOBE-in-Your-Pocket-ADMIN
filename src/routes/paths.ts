export const ROUTES = {
  login: "/login",
  dashboard: "/",
  forbidden: "/403",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
