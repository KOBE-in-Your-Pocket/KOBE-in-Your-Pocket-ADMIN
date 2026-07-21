import type { ReactNode } from "react";
import { Card } from "../../components";

export type ScreenPlaceholderProps = {
  title: string;
  /** どの Issue で実装するか等の補足。 */
  note?: ReactNode;
};

/**
 * 画面本体の実装前に置くプレースホルダ。
 *
 * ルートが全パス解決するようにするための仮画面で、各 feature の
 * 一覧・フォーム画面（#21〜#23）や準備中セクション（#24/#25）で
 * 中身に差し替える。
 */
export function ScreenPlaceholder({ title, note }: ScreenPlaceholderProps) {
  return (
    <section>
      <h1>{title}</h1>
      <Card>
        <p className="muted" style={{ margin: 0 }}>
          {note ?? "この画面は準備中です。"}
        </p>
      </Card>
    </section>
  );
}
