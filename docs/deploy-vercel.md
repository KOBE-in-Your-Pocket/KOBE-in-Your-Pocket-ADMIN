# Vercel デプロイ手順

管理画面（ADMIN）を Vercel に配信するための設定と手順。

> ## 通信はすべて暗号化されている（2026-09-03 〜）
>
> 以前は Vercel → EC2 の区間が平文で、ログインの email / パスワードと JWT が公開
> インターネットを平文で通っていた。そのため「デモ専用アカウントを使う」「operator に限る」
> 「期間を区切る」といった運用条件でしのいでいたが、**Backend の HTTPS 化（Backend #121）に
> より解消した**。現在は経路全体が TLS で保護されている。
>
> それでも次は守ること。**平文かどうかとは別に、配るアカウントの権限は本物**だから。
>
> 1. **デモ専用アカウントを新規に作る** — 他で使っているパスワードを使い回さない
> 2. **operator ロールにする（admin を配らない）** — admin の JWT が漏れると
>    `DELETE /api/v1/auth/users/{id}` でユーザーを削除される経路が生まれる。
>    operator ならスポットの削除ボタンも表示されない。避難所の削除 API（Backend #144）は
>    operator でも実行でき、Flyway seed（V9）は再実行では戻らないため、
>    **配布アカウントの管理は引き続き慎重に**
> 3. **用が済んだらアカウントを無効化する**
>
> なお API のホスト名 `18-181-34-28.sslip.io` は、証明書が IP アドレスには発行されないため
> 借りている暫定の名前。独自ドメイン取得後は `vercel.json` の destination を 1 行変えるだけで
> 移行できる。

## 構成

```
ブラウザ ──(https)──> Vercel ──(https)──> EC2 の Caddy ──(内部)──> Backend (:9090)
                       ↑ /api/* を rewrite で中継      ↑ TLS 終端
```

ブラウザからは **同一オリジンの HTTPS** にしか通信しない。`/api/*` だけを Vercel が
サーバ側で Backend へ中継する（`vercel.json` の `rewrites`）。

この形にしている理由は2つ。

1. **CORS 設定が不要** — Backend に CORS 設定は入っていない。別オリジンから叩くには
   Backend 側の実装追加とデプロイが必要になるが、同一オリジンなら発生しない
2. **API のホスト名を隠せる** — ブラウザから見える URL は Vercel のものだけになる

Backend が HTTPS になったのでブラウザから直接叩いても mixed content にはならないが、
CORS 設定が無いため rewrite 経由の構成は維持する。

`src/api/client.ts` は `VITE_API_BASE_URL` が未設定なら同一オリジンを使うため、
**Vercel では `VITE_API_BASE_URL` を設定しない**こと。

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
| `VITE_API_BASE_URL` | **設定しない** | **設定しない** | 同一オリジン（rewrite 経由）を使う |

> 以前あった `VITE_ENABLE_MOCK_SCREENS` は廃止した。ダッシュボードが統計 API
> （Backend #169）に繋がり、mock 画面を出し分ける必要が無くなったため。
> **Vercel 側に残っている場合は削除してよい**（設定されていても無視される）。

画面ごとのデータ源は次のとおり。

| 画面 | データ |
|---|---|
| スポット / レビュー / ユーザー / ダッシュボード | 実 API |
| マナー / 避難所 / ジャンル / 統計 / 操作ログ | 準備中画面 |

## ブランチとデプロイの対応

| ブランチ | Vercel 環境 |
|---|---|
| `main` | Production |
| `develop` | Preview |
| PR ブランチ | Preview（PR ごとに URL が発行される） |

画面の内容は環境によらず同じ（上表「画面ごとのデータ源」を参照）。

## デプロイ後の確認

- [ ] ログインできる（= rewrite が効いていて API に到達している）
- [ ] スポット一覧に実データが出る
- [ ] スポットの追加・編集・削除・画像アップロードが動く
- [ ] レビュー・ユーザーに実データが出る
- [ ] ダッシュボードに実データが出る（総数・人気スポット・最近のレビュー投稿）
- [ ] ページを直接リロードしても 404 にならない（SPA fallback の確認。例: `/spots` を直接開く）

API に到達できているかは、ブラウザの DevTools → Network で `/api/v1/tourism/spots` が
**200** を返しているかで判断する。Backend 自体が落ちている場合は次で確認できる。

```bash
# /actuator は Caddy が外部から遮断しているため、疎通は公開 API で確認する
curl -s -o /dev/null -w "%{http_code}\n" https://18-181-34-28.sslip.io/api/ping
```

## デモ用アカウントの用意

冒頭の運用条件2に従い、**operator ロールの専用アカウント**を作る。

1. アカウントを作成する（`POST /api/v1/auth/signup` は公開エンドポイント）

   ```bash
   curl -X POST https://18-181-34-28.sslip.io/api/v1/auth/signup \
     -H 'Content-Type: application/json' \
     -d '{"email":"demo-operator@example.com","password":"＜使い捨ての強いパスワード＞","name":"デモ用"}'
   ```

2. **Supabase のダッシュボードで、そのユーザーの `app_metadata.role` を `operator` に設定する**

   signup 直後は一般ロールで、管理画面にログインできない（`AuthGuard` が弾く）。
   ロールは JWT の `app_metadata.role` から解決されるため、Supabase 側での設定が必須。

3. 管理画面にログインできること、スポットの一覧・追加・編集が動くこと、
   **削除ボタンが表示されないこと**（= operator である証拠）を確認する

## デモが終わったら（後片付け）

配布したアカウントが有効なまま残らないよう、必ず実施する。

- [ ] Vercel のデプロイを停止する（プロジェクト削除、または Deployment を Disable）
- [ ] デモ用アカウントを削除する、またはパスワードを変更する
- [ ] デモ中に追加されたテスト用スポットを削除する（データを綺麗に戻す）

## Backend の URL が変わったら

`vercel.json` の `rewrites[0].destination` を書き換えて push するだけ。
環境変数ではなくファイルに直書きしているのは、`vercel.json` の rewrite が
環境変数の展開に対応していないため。
