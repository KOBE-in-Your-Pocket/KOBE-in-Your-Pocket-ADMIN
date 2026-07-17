# KOBE-in-Your-Pocket-ADMIN

[KOBE-in-Your-Poket-Client-Backend](https://github.com/KOBE-in-Your-Pocket/KOBE-in-Your-Poket-Client-Backend) 向けの運営・管理者 Web 画面（SPA）。

## 技術スタック

- Vite + React 19 + TypeScript
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

### 開発（既定）

`pnpm dev` では `/api/*` を Vite プロキシ経由で Backend へ転送します（CORS 不要）。

転送先の変更:

```bash
VITE_PROXY_TARGET=http://localhost:9090 pnpm dev
```

### 本番ビルド

`.env` に API のベース URL を設定:

```bash
VITE_API_BASE_URL=https://your-backend.example.com
```

## ディレクトリ構成（予定）

```
src/
├── api/          # fetch ラッパ・エンドポイント定義
├── app/          # ルーティング・ガード
├── pages/        # 画面
├── widgets/      # レイアウト（ヘッダー・サイドバー等）
├── features/     # 機能単位 UI
└── shared/       # 共通 UI・設定・型
```

## ロール

運営アカウント・ロール付与は **Supabase ダッシュボード**で手動設定（`app_metadata.role`: `operator` / `admin`）。
