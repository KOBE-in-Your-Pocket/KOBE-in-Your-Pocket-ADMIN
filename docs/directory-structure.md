# ディレクトリ構成ガイド

KOBE-in-Your-Pocket-ADMIN のソースコードを **どこに置くか** を判断するためのガイド。

---

## TL;DR

| 迷ったら | 置き場所 |
| --- | --- |
| 共通 API クライアント | `src/api/` |
| 2つ以上の feature で使う UI | `src/components/` |
| 1つの機能に閉じるコード | `src/features/{name}/` |
| 機能横断の hooks | `src/hooks/` |
| ログイン後のレイアウト | `src/layouts/` |
| ユーティリティ | `src/lib/` |
| ルーティング・ガード | `src/routes/` |
| 共通型 | `src/types/` |

**画面（Screen）は必ず `features/*/screens/` に置く。** トップレベルの `screens/` は作らない。

**機能専用 UI は `features/*/components/`。** 汎用 UI のみ `src/components/`。

---

## 全体構成

```
src/
├── api/                         # 共通 fetch クライアント
├── assets/
│   └── logo/
├── components/                  # 汎用 UI（Button, Table, Modal 等）
├── features/                    # 機能モジュール
│   ├── auth/                    # 認証（context / API / ログイン画面）
│   ├── dashboard/
│   ├── spots/                   # Phase 1 以降で追加
│   ├── users/
│   └── …
├── hooks/                       # 汎用 hooks のみ
├── layouts/
│   └── components/              # AppLayout 等
├── lib/                         # storage, format 等
├── routes/                      # Router 定義・ガード・パス定数
├── styles/                      # tokens.css（デザイントークン）/ global.css（リセット・基本要素）
├── types/                       # Role 等の共通型
├── index.css                    # 画面共通のレイアウト・ユーティリティクラス
└── main.tsx
```

---

## features/ の内部構造

各 feature は同じ形で揃える。

```
src/features/spots/
├── api/           # その機能の API 呼び出し
├── components/    # その機能専用 UI
├── hooks/         # その機能専用 hooks
├── screens/       # ルートと対応する画面
└── index.ts       # 外部公開 API
```

### モジュール一覧（予定）

| feature | 内容 | Phase |
| --- | --- | --- |
| `auth` | ログイン・JWT・AuthProvider | 1 |
| `dashboard` | ダッシュボード | 1 / 4 |
| `spots` | スポット CRUD | 1–2 |
| `users` | ユーザー一覧・削除 | 1 |
| `reviews` | レビューモデレーション | 2 |
| `manner` | マナー項目 | 3 |
| `evacuation` | 避難所 | 3 |
| `genres` | ジャンル | 3 |
| `stats` | 統計 | 4 |

---

## auth モジュール

`login` ではなく **`auth` に統一**。以下を1モジュールにまとめる。

- `AuthProvider.tsx` — 認証 context
- `api/auth-api.ts` — Backend `/api/v1/auth/*`
- `hooks/` — `useLogin`, `useLogout` 等
- `components/` — `LoginForm` 等
- `screens/LoginScreen.tsx`

---

## import ルール

```
routes, layouts  → features, components, shared 系
features         → api, lib, types, components（汎用のみ）
components       → 依存最小（他 feature を import しない）
api, lib, types  → 下位層のみ
```

| NG | 理由 |
| --- | --- |
| `features/spots` が `features/users` 内部を直接 import | モジュール境界違反 |
| 機能専用 UI を `components/` に置く | 汎用/専用の混在 |
| 画面をトップ `screens/` に置く | 採用しない方針 |

---

## 関連ドキュメント

- [minutes/admin/2026-07-16_管理者画面_機能要件一覧.md](../../minutes/admin/2026-07-16_管理者画面_機能要件一覧.md)
