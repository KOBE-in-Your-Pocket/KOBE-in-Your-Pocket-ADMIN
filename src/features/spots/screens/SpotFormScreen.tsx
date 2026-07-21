import { useParams } from "react-router-dom";
import { ScreenPlaceholder } from "../../../layouts";

/** スポットの新規追加・編集フォーム。UI 本体は #21 で実装する。 */
export function SpotFormScreen() {
  const { id } = useParams();
  return (
    <ScreenPlaceholder
      title={id ? "スポット編集" : "スポット新規追加"}
      note={
        id
          ? `スポット「${id}」の編集フォームは #21 で実装します。`
          : "スポット追加フォームは #21 で実装します。"
      }
    />
  );
}
