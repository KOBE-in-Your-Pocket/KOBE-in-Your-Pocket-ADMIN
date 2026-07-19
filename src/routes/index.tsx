import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider, LoginScreen } from "../features/auth";
import { DashboardScreen } from "../features/dashboard";
import {
  AppLayout,
  ForbiddenScreen,
  RootRedirect,
} from "../layouts";
import { createQueryClient } from "../lib/query-client";
import { AdminGuard, AuthGuard } from "./guards";
import { ROUTES } from "./paths";

const router = createBrowserRouter([
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
