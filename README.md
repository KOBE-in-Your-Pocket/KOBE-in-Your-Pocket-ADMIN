# KOBE-in-Your-Pocket-ADMIN

[KOBE-in-Your-Poket-Client-Backend](https://github.com/KOBE-in-Your-Pocket/KOBE-in-Your-Poket-Client-Backend) 向けの運営・管理者 Web 画面（SPA）。

## 技術スタック

- Vite + React 19 + TypeScript
- React Router
- Backend REST API（Supabase 直叩きしない）

## セットアップ

```bash
pnpm install
cp .env.example .env   # 必要に応じて編集
pnpm dev               # http://localhost:5173
```

| コマンド | 内容 |
| --- | --- |
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | 型チェック + 本番ビルド |
| `pnpm lint` | oxlint |
| `pnpm preview` | ビルド結果の確認 |

## Backend 接続

開発時は `/api/*` を Vite プロキシ経由で Backend へ転送（CORS 不要）。

```bash
VITE_PROXY_TARGET=http://localhost:9090 pnpm dev
```

## ディレクトリ構成

[`docs/directory-structure.md`](./docs/directory-structure.md) を参照。

要点:

- 画面は **`features/*/screens/`** に統一（トップ `screens/` は作らない）
- **`components/`** は汎用 UI のみ
- 認証は **`features/auth/`** に集約（context / API / ログイン画面）

## 要件

- [minutes/admin/2026-07-16_管理者画面_機能要件一覧.md](../minutes/admin/2026-07-16_管理者画面_機能要件一覧.md)

## ロール

運営アカウント・ロール付与は **Supabase ダッシュボード**で手動設定（`app_metadata.role`: `operator` / `admin`）。
