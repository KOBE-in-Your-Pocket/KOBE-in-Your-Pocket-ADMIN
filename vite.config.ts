import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * dev プロキシ: backend に CORS 設定が入るまでの暫定経路。
 * 同一オリジン (/api/...) で fetch し、転送先へ中継する。
 *
 *   VITE_PROXY_TARGET=http://localhost:9090 pnpm dev
 *
 * 既定は本番 EC2 の HTTPS の入り口（Caddy）。Vercel の rewrites（vercel.json）と同じ先。
 * EC2 の 9090 番は外に公開していないため（Backend #221）、直接は繋がらない。
 */
const proxyTarget =
  process.env.VITE_PROXY_TARGET ?? "https://18-181-34-28.sslip.io";

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
