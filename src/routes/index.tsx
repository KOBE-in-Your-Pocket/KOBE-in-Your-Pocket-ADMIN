import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { createBrowserRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { AuthProvider, LoginScreen } from "../features/auth";
import { DashboardScreen } from "../features/dashboard";
import {
  AppLayout,
  ForbiddenScreen,
  RootRedirect,
} from "../layouts";
import { createQueryClient } from "../lib/query-client";
import { AdminGuard, AuthGuard } from "./guards";
import { DEV_ROUTES, ROUTES } from "./paths";

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
  {
    path: ROUTES.login,
    element: <LoginScreen />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardScreen /> },
          {
            element: <AdminGuard />,
            children: [
              { path: "logs", element: <ForbiddenScreen /> },
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
