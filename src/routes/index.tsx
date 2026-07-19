import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider, LoginScreen } from "../features/auth";
import { DashboardScreen } from "../features/dashboard";
import {
  AppLayout,
  ForbiddenScreen,
  RootRedirect,
} from "../layouts";
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
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
