# Vercel デプロイ手順

管理画面（ADMIN）を Vercel に配信するための設定と手順。

> ## ⚠️ この構成は「検証用の暫定」です。運用条件を必ず守ること
>
> Vercel → EC2 の区間が暗号化されていないため（後述）、**ログインの email / パスワードと
> JWT が平文で公開インターネットを通ります**。傍受された場合、そのトークンで**本番 Backend**
> を操作できてしまいます。
>
> 見せるデータがシードかどうかは関係ありません。問題は**アカウントの権限が本物である**ことです。
>
> ### 守る条件
>
> 1. **デモ専用アカウントを新規に作る** — 他で使っているパスワードを絶対に使い回さない
> 2. **operator ロールにする（admin を配らない）** — admin の JWT が漏れると
>    `DELETE /api/v1/auth/users/{id}` でユーザーを削除される経路が生まれる。
>    operator ならスポットの削除ボタンも表示されない
> 3. **期間を区切る** — 用が済んだらデプロイを停止し、アカウントのパスワード変更または削除
> 4. **URL を不特定多数に配らない**
>
> この条件下での最悪ケースは「傍受されたトークンでシードのスポットが荒らされる」程度で、
> 復旧可能。**admin アカウントを配る場合はこの条件を満たさないので、HTTPS 化を先に行うこと。**
>
> 恒久対応は Backend の HTTPS 化（Backend Issue #120 / #121）。完了後は
> `vercel.json` の destination を1行変えるだけで移行でき、本節の制約は解消する。

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

> **⚠️ Vercel → EC2 の区間は暗号化されていない。** 冒頭の運用条件を必ず守ること。

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

## デモ用アカウントの用意

冒頭の運用条件2に従い、**operator ロールの専用アカウント**を作る。

1. アカウントを作成する（`POST /api/v1/auth/signup` は公開エンドポイント）

   ```bash
   curl -X POST http://18.181.34.28:9090/api/v1/auth/signup \
     -H 'Content-Type: application/json' \
     -d '{"email":"demo-operator@example.com","password":"＜使い捨ての強いパスワード＞","name":"デモ用"}'
   ```

2. **Supabase のダッシュボードで、そのユーザーの `app_metadata.role` を `operator` に設定する**

   signup 直後は一般ロールで、管理画面にログインできない（`AuthGuard` が弾く）。
   ロールは JWT の `app_metadata.role` から解決されるため、Supabase 側での設定が必須。

3. 管理画面にログインできること、スポットの一覧・追加・編集が動くこと、
   **削除ボタンが表示されないこと**（= operator である証拠）を確認する

## デモが終わったら（後片付け）

運用条件3。放置すると平文の経路が残り続けるため、必ず実施する。

- [ ] Vercel のデプロイを停止する（プロジェクト削除、または Deployment を Disable）
- [ ] デモ用アカウントを削除する、またはパスワードを変更する
- [ ] デモ中に追加されたテスト用スポットを削除する（データを綺麗に戻す）

## Backend の URL が変わったら

`vercel.json` の `rewrites[0].destination` を書き換えて push するだけ。
環境変数ではなくファイルに直書きしているのは、`vercel.json` の rewrite が
環境変数の展開に対応していないため。
