import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBearerInterceptor, setRequestInterceptor } from "./api";
import { getAccessToken } from "./lib/storage";
import { AppRouter } from "./routes";
import "./styles/global.css";
import "./index.css";

// 保存済みアクセストークンを全 API リクエストの Authorization に付与する（#28）。
// getAccessToken はリクエストごとに評価されるため、ログイン後の保存が即座に反映される。
setRequestInterceptor(createBearerInterceptor(getAccessToken));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
