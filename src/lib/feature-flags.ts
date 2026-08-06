/**
 * ビルド時に決まる表示切り替え。
 *
 * Vite が `import.meta.env` を静的置換するため、false 側のコードは本番バンドルから
 * 除去される（mock データがデプロイ成果物に混入しない）。
 */

/**
 * mock 固定データの画面（ダッシュボード / レビュー / ユーザー）を表示するか。
 *
 * **既定は false**（＝準備中画面）。実 API に繋がっていない画面を、あたかも動いて
 * いるかのように外部へ見せないための安全側の既定値。開発時に mock を見たい場合だけ
 * `pnpm dev:mock`（`.env.mock` の `VITE_ENABLE_MOCK_SCREENS=true`）で明示的に有効化する。
 */
export const SHOW_MOCK_SCREENS =
  import.meta.env.VITE_ENABLE_MOCK_SCREENS === "true";
