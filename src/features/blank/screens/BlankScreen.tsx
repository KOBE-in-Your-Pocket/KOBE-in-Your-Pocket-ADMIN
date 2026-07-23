import { ToolboxIcon } from "../../../components";
import styles from "./BlankScreen.module.css";

/**
 * manner / shelter / genre / stats / logs 等の準備中セクション。
 *
 * ADMIN-image pages/blank 準拠。4セクションで共用し、title でセクション名を渡す。
 */
export function BlankScreen({ title }: { title: string }) {
  return (
    <>
      <h1 className={styles.pageTitle}>{title}</h1>
      <div className={styles.panel}>
        <div className={styles.placeholder}>
          <ToolboxIcon size={46} />
          <div className={styles.text}>このセクションは準備中です。</div>
        </div>
      </div>
    </>
  );
}
