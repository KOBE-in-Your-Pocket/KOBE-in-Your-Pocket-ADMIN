import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * dev プロキシ: backend に CORS 設定が入るまでの暫定経路。
 * 同一オリジン (/api/...) で fetch し、転送先へ中継する。
 *
 *   VITE_PROXY_TARGET=http://localhost:9090 pnpm dev
 */
const proxyTarget =
  process.env.VITE_PROXY_TARGET ?? "http://18.181.34.28:9090";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
});
