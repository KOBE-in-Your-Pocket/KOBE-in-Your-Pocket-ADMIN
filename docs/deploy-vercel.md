# Vercel デプロイ手順

管理画面（ADMIN）を Vercel に配信するための設定と手順。

## 構成

```
ブラウザ ──(https)──> Vercel ──(http)──> EC2 の Backend (18.181.34.28:9090)
                       ↑ /api/* を rewrite で中継
```

ブラウザからは **同一オリジンの HTTPS** にしか通信しない。`/api/*` だけを Vercel が
サーバ側で Backend へ中継する（`vercel.json` の `rewrites`）。

この形にしている理由は2つ。

1. **mixed content の回避** — Vercel は HTTPS 配信。Backend は http なので、ブラウザから
   直接叩くと «混在コンテンツ» としてブロックされ、ログインすら通らない
2. **CORS 設定が不要** — Backend に CORS 設定は入っていない。別オリジンから叩くには
   Backend 側の実装追加とデプロイが必要になるが、同一オリジンなら発生しない

`src/api/client.ts` は `VITE_API_BASE_URL` が未設定なら同一オリジンを使うため、
**Vercel では `VITE_API_BASE_URL` を設定しない**こと。

> **⚠️ Vercel → EC2 の区間は暗号化されていない。**
> ログインの email / パスワードと JWT が平文で公開インターネットを通る。
> **検証用アカウントでの利用に留めること。** 実運用のアカウントを配る前に
> Backend の HTTPS 化（Backend Issue #120 / #121）を済ませる。
> 完了後は `vercel.json` の destination を `https://<ドメイン>/api/:path*` に変えるだけでよい。

## 初回セットアップ（1回だけ）

1. [vercel.com](https://vercel.com) にログイン（GitHub アカウント連携）
2. **Add New → Project** → `KOBE-in-Your-Pocket-ADMIN` を Import
3. 設定はほぼ自動検出される。以下だけ確認する
   - **Framework Preset**: Vite
   - **Build Command / Output Directory**: `vercel.json` の値が使われる（触らなくてよい）
   - **Node.js Version**: 22.x（`.node-version` に合わせる）
4. **Environment Variables** を設定（下表）
5. Deploy

### 環境変数

| 変数 | Production | Preview | 効果 |
|---|---|---|---|
| `VITE_ENABLE_MOCK_SCREENS` | **設定しない** | `true` | Preview のみ mock 画面を表示 |
| `VITE_API_BASE_URL` | **設定しない** | **設定しない** | 同一オリジン（rewrite 経由）を使う |

Production（`main`）は準備中画面、Preview（`develop` や PR）は mock 画面になる。
切り替えの仕組みは `src/lib/feature-flags.ts` を参照。

## ブランチとデプロイの対応

| ブランチ | Vercel 環境 | 画面 |
|---|---|---|
| `main` | Production | 実 API + 準備中画面（外部に見せる用） |
| `develop` | Preview | 実 API + mock 画面 |
| PR ブランチ | Preview | 同上（PR ごとに URL が発行される） |

## デプロイ後の確認

- [ ] ログインできる（= rewrite が効いていて API に到達している）
- [ ] スポット一覧に実データが出る
- [ ] スポットの追加・編集・削除・画像アップロードが動く
- [ ] ダッシュボード / レビュー / ユーザーが **準備中**（Production の場合）
- [ ] ページを直接リロードしても 404 にならない（SPA fallback の確認。例: `/spots` を直接開く）

API に到達できているかは、ブラウザの DevTools → Network で `/api/v1/tourism/spots` が
**200** を返しているかで判断する。Backend 自体が落ちている場合は次で確認できる。

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://18.181.34.28:9090/actuator/health
```

## Backend の URL が変わったら

`vercel.json` の `rewrites[0].destination` を書き換えて push するだけ。
環境変数ではなくファイルに直書きしているのは、`vercel.json` の rewrite が
環境変数の展開に対応していないため。
