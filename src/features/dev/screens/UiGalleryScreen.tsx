import { useState } from "react";
import { Button, Input, Spinner } from "../../../components";
import styles from "./UiGalleryScreen.module.css";

/**
 * 汎用 UI の目視確認用ギャラリー（開発ビルド限定 / `/dev/ui`）。
 *
 * Storybook は依存とメンテコストが大きいため、まずはこの画面で代替する（#54）。
 * components/ に部品を追加したら、ここにも状態を一通り並べること。
 */
export function UiGalleryScreen() {
  const [text, setText] = useState("");

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
    </div>
  );
}
