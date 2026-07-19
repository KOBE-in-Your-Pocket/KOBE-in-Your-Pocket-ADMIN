# AI / 人間共通 PR レビュー基準

このファイルは PR レビュー（[CodeRabbit](https://github.com/apps/coderabbitai) 一次レビュー・人間レビュー共通）の判断基準です。
詳細な配置ルールは [`docs/directory-structure.md`](./docs/directory-structure.md) を参照してください。

## プロジェクト概要

- 神戸市特化観光アプリ **KOBE in Your Pocket** の運営・管理者 Web 画面
- Vite + React 19 + TypeScript + React Router + TanStack Query（導入予定）
- Backend REST API 経由（Supabase / service_role を Frontend に載せない）
- PR は `develop` 向け

## アーキテクチャ（最重要）

| 迷ったら | 置き場所 |
| --- | --- |
| 共通 API クライアント | `src/api/` |
| 汎用 UI | `src/components/` |
| 機能単位 | `src/features/{name}/` |
| 画面 | `features/*/screens/`（トップ `screens/` は作らない） |
| レイアウト | `src/layouts/` |
| ルーティング・ガード | `src/routes/` |

## コード品質

- ADMIN-image を **UI 参考** とする。構成は本リポジトリの `docs/directory-structure.md` に従う
- TanStack Query のキャッシュ・エラー・401/403 ハンドリングが適切か
- operator / admin の権限差（削除等）が UI と API 両方で守られているか
- 不要な `any`、未使用コード、デバッグログが残っていないか

## セキュリティ

- API キー・JWT secret・`service_role` のハードコード禁止
- トークンを console.log しない

## CI で既に担保されている項目（レビュー不要）

- oxlint (`pnpm lint`)
- TypeScript + Vite build (`pnpm build`)

これらは指摘せず、設計・ロジック・仕様妥当性に集中すること。
