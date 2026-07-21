import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Input,
  Modal,
  Pagination,
  SearchInput,
  Spinner,
  StarRating,
  Table,
  type Column,
} from "../../../components";
import styles from "./UiGalleryScreen.module.css";

type DemoRow = { id: string; name: string; role: string; count: number };

const DEMO_ROWS: DemoRow[] = [
  { id: "1", name: "北野異人館", role: "operator", count: 12 },
  { id: "2", name: "神戸ハーバーランド", role: "admin", count: 5 },
];

const DEMO_COLUMNS: Column<DemoRow>[] = [
  { key: "name", header: "名前", primary: true },
  { key: "role", header: "ロール" },
  { key: "count", header: "レビュー数", align: "end" },
  {
    key: "actions",
    header: "",
    headerLabel: "操作",
    align: "end",
    cell: () => (
      <Button size="sm" variant="danger">
        削除
      </Button>
    ),
  },
];

/**
 * 汎用 UI の目視確認用ギャラリー（開発ビルド限定 / `/dev/ui`）。
 *
 * Storybook は依存とメンテコストが大きいため、まずはこの画面で代替する（#54）。
 * components/ に部品を追加したら、ここにも状態を一通り並べること。
 */
export function UiGalleryScreen() {
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>UI ギャラリー</h1>
      <p className={styles.lead}>
        src/components の汎用 UI 一覧。開発ビルドでのみ表示されます。
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Button</h2>

        <p className={styles.caseTitle}>variant（size=md）</p>
        <div className={styles.row}>
          <Button>保存する</Button>
          <Button variant="secondary">キャンセル</Button>
          <Button variant="danger">削除する</Button>
          <Button variant="ghost">条件をクリア</Button>
        </div>

        <p className={styles.caseTitle}>size=sm（テーブル行内の操作）</p>
        <div className={styles.row}>
          <Button size="sm">編集</Button>
          <Button size="sm" variant="secondary">複製</Button>
          <Button size="sm" variant="danger">削除</Button>
        </div>

        <p className={styles.caseTitle}>loading（操作は自動で無効化される）</p>
        <div className={styles.row}>
          <Button loading>送信中</Button>
          <Button variant="secondary" loading>読み込み中</Button>
          <Button variant="danger" loading>削除中</Button>
        </div>

        <p className={styles.caseTitle}>disabled</p>
        <div className={styles.row}>
          <Button disabled>保存する</Button>
          <Button variant="secondary" disabled>キャンセル</Button>
          <Button variant="danger" disabled>削除する</Button>
        </div>

        <p className={styles.caseTitle}>fullWidth</p>
        <div className={styles.stack}>
          <Button fullWidth>ログイン</Button>
        </div>

        <p className={styles.caseTitle}>長いラベル・日本語の折り返し確認</p>
        <div className={styles.stack}>
          <Button>この操作は取り消せません。実行してよろしいですか</Button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Input</h2>
        <div className={styles.stack}>
          <Input
            label="スポット名"
            placeholder="北野異人館"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Input label="メールアドレス" type="email" hint="社内メールを入力してください" />
          <Input label="パスワード" type="password" required error="6文字以上で入力してください" />
          <Input label="登録日" type="date" disabled defaultValue="2026-07-19" />
          <Input
            label="とても長いラベルの場合にレイアウトが崩れないかを確認するための項目名"
            placeholder="プレースホルダ"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Spinner</h2>

        <p className={styles.caseTitle}>size</p>
        <div className={styles.row}>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>

        <p className={styles.caseTitle}>onDark（濃い背景の上）</p>
        <div className={styles.dark}>
          <Spinner size="sm" onDark />
          <Spinner size="md" onDark />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Badge</h2>
        <div className={styles.row}>
          <Badge>admin</Badge>
          <Badge tone="operator">operator</Badge>
          <Badge tone="success">公開中</Badge>
          <Badge tone="warning">下書き</Badge>
          <Badge tone="danger">非公開</Badge>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>StarRating</h2>
        <div className={styles.row} style={{ gap: 20 }}>
          <StarRating rating={5} />
          <StarRating rating={4.2} showValue />
          <StarRating rating={3} />
          <StarRating rating={2.5} />
          <StarRating rating={0} />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>SearchInput</h2>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="スポット名で検索"
          aria-label="スポット名で検索"
        />
        <p className="muted" style={{ marginTop: 8 }}>
          入力値: {search || "（空）"}
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Pagination</h2>
        <p className={styles.caseTitle}>全 20 ページ・現在 {page}</p>
        <Pagination
          currentPage={page}
          totalPages={20}
          onPageChange={setPage}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Card</h2>
        <div className={styles.stack}>
          <Card title="タイトル付きカード">
            <p className="muted">本文がここに入ります。</p>
          </Card>
          <Card>タイトル無しのカード。</Card>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Table</h2>

        <p className={styles.caseTitle}>データあり</p>
        <Table
          columns={DEMO_COLUMNS}
          data={DEMO_ROWS}
          rowKey={(r) => r.id}
        />

        <p className={styles.caseTitle}>空状態</p>
        <Table
          columns={DEMO_COLUMNS}
          data={[]}
          rowKey={(r) => r.id}
          empty="スポットがまだありません"
        />

        <p className={styles.caseTitle}>ローディング</p>
        <Table columns={DEMO_COLUMNS} data={[]} rowKey={(r) => r.id} loading />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Modal / ConfirmDialog</h2>
        <div className={styles.row}>
          <Button onClick={() => setModalOpen(true)}>Modal を開く</Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            削除確認を開く
          </Button>
        </div>
      </section>

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)} width={420} label="サンプル">
          <h3 style={{ marginTop: 0 }}>サンプルモーダル</h3>
          <p className="muted">
            Escape・オーバーレイクリック・閉じるボタンで閉じます。Tab
            はこの中を循環します。
          </p>
          <Input label="フォーカストラップ確認用" placeholder="入力できます" />
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button onClick={() => setModalOpen(false)}>閉じる</Button>
          </div>
        </Modal>
      )}

      {confirmOpen && (
        <ConfirmDialog
          title="スポットを削除しますか？"
          message="「北野異人館」を削除します。"
          note="この操作は取り消せません。"
          loading={confirmLoading}
          onConfirm={() => {
            // loading 表示の確認用に少し待ってから閉じる
            setConfirmLoading(true);
            setTimeout(() => {
              setConfirmLoading(false);
              setConfirmOpen(false);
            }, 1200);
          }}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
