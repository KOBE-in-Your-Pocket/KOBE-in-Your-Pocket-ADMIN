import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  type RouteObject,
} from "react-router-dom";
import { AuthProvider, LoginScreen, useAuth } from "../features/auth";
import { landingPath } from "../features/auth/mock-auth";
import { BlankScreen } from "../features/blank";
import { DashboardScreen } from "../features/dashboard";
import { ReviewListScreen } from "../features/reviews";
import { SpotFormScreen, SpotListScreen } from "../features/spots";
import { UserListScreen } from "../features/users";
import { AppLayout, ForbiddenScreen, RootRedirect } from "../layouts";
import { createQueryClient } from "../lib/query-client";
import { AdminGuard, AuthGuard } from "./guards";
import { DEV_ROUTES, ROUTE_PATTERNS, ROUTES } from "./paths";

/** ログイン済みなら /login を出さずロールの初期画面へ送る。 */
function LoginRoute() {
  const { user } = useAuth();
  if (user !== null) return <Navigate to={landingPath(user.role)} replace />;
  return <LoginScreen />;
}

/**
 * 開発ビルド限定のルート。
 *
 * import.meta.env.DEV は本番ビルドで false に静的置換されるため、
 * この分岐ごと除去され、動的 import 先のコードも本番バンドルに含まれない。
 */
const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: DEV_ROUTES.uiGallery,
        lazy: async () => ({
          Component: (await import("../features/dev")).UiGalleryScreen,
        }),
      },
    ]
  : [];

const router = createBrowserRouter([
  ...devRoutes,
  { path: ROUTES.login, element: <LoginRoute /> },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardScreen /> },

          // スポット
          { path: ROUTES.spots, element: <SpotListScreen /> },
          { path: ROUTES.spotNew, element: <SpotFormScreen /> },
          { path: ROUTE_PATTERNS.spotEdit, element: <SpotFormScreen /> },

          // レビュー・ユーザー
          { path: ROUTES.reviews, element: <ReviewListScreen /> },
          { path: ROUTES.users, element: <UserListScreen /> },

          // 準備中セクション（#24）
          { path: ROUTES.manner, element: <BlankScreen title="マナー" /> },
          { path: ROUTES.shelter, element: <BlankScreen title="避難所" /> },
          { path: ROUTES.genre, element: <BlankScreen title="ジャンル" /> },
          { path: ROUTES.stats, element: <BlankScreen title="統計" /> },

          // admin 専用（#25）
          {
            element: <AdminGuard />,
            children: [
              { path: ROUTES.logs, element: <BlankScreen title="操作ログ" /> },
            ],
          },
        ],
      },
    ],
  },
  { path: ROUTES.forbidden, element: <ForbiddenScreen /> },
  { path: "*", element: <RootRedirect /> },
]);

export function AppRouter() {
  // StrictMode の再マウントや再レンダリングでキャッシュを捨てないよう state で保持する。
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
