import type { ReactNode } from "react";
import { Spinner } from "../spinner";
import styles from "./Table.module.css";

export type Column<T> = {
  /** React key 兼、cell 省略時に row から取り出すプロパティ名。 */
  key: string;
  header: ReactNode;
  /** セルの描画。省略時は row[key] を文字列として表示する。 */
  cell?: (row: T) => ReactNode;
  /** 行の主となるセル（名前など）。見出し色・太字になる。 */
  primary?: boolean;
  align?: "start" | "center" | "end";
  /** ヘッダーの読み上げ。header が非テキストのとき用。 */
  headerLabel?: string;
};

export type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  /** 行の一意キー。 */
  rowKey: (row: T) => string;
  /** データが空のときの表示。 */
  empty?: ReactNode;
  /** 取得中。行の代わりにスピナーを出す。 */
  loading?: boolean;
};

/** align に対応するスコープ済みクラス（start は既定なのでクラス無し）。 */
function alignClass(align: Column<unknown>["align"]): string {
  if (align === "center") return styles.alignCenter;
  if (align === "end") return styles.alignEnd;
  return "";
}

/**
 * columns 定義駆動の汎用テーブル。
 *
 * loading / 空状態を Table 側で一元化するため、各一覧画面は columns と data を
 * 渡すだけでよい。横幅超過時はスクロールコンテナ内でのみ横スクロールする。
 */
export function Table<T>({
  columns,
  data,
  rowKey,
  empty = "データがありません",
  loading = false,
}: TableProps<T>) {
  const colCount = columns.length;

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headRow}>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${styles.th} ${alignClass(col.align)}`.trim()}
                aria-label={col.headerLabel}
                scope="col"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className={styles.stateCell} colSpan={colCount}>
                <span className={styles.stateInner}>
                  {/* 隣に「読み込み中…」があるため二重読み上げを避ける */}
                  <Spinner size="sm" label={null} />
                  読み込み中…
                </span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td className={styles.stateCell} colSpan={colCount}>
                {empty}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={rowKey(row)} className={styles.row}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[
                      styles.td,
                      col.primary ? styles.tdPrimary : "",
                      alignClass(col.align),
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {col.cell
                      ? col.cell(row)
                      : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
