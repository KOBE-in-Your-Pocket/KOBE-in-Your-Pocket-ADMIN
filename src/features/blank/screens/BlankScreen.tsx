import { ScreenPlaceholder } from "../../../layouts";

/** manner / shelter / genre / stats / logs 等の準備中セクション。UI は #24 / #25。 */
export function BlankScreen({ title }: { title: string }) {
  return (
    <ScreenPlaceholder
      title={title}
      note="このセクションは準備中です。"
    />
  );
}
