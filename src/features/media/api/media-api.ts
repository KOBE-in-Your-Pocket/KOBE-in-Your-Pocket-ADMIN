/**
 * メディア（画像）アップロードの API。
 *
 * 画像を Backend 経由で S3 に保存し、公開 URL を受け取る。運営（operator/admin）限定。
 * 受け取った URL をスポット等の imageUrl として登録・編集に使う。
 */
import { apiRequest } from "../../../api";

/** POST /api/v1/media/uploads のレスポンス（Backend `MediaUploadResponse`）。 */
type MediaUploadResponse = {
  imageUrl: string;
};

/**
 * 画像ファイルをアップロードし、保存先の公開 URL を返す
 * （POST /api/v1/media/uploads, multipart/form-data）。
 *
 * 送信フィールド名は Backend 契約に合わせて `file`。Content-Type は
 * ブラウザが boundary 付きで自動設定するため明示しない。
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiRequest<MediaUploadResponse>(
    "/api/v1/media/uploads",
    {
      method: "POST",
      body: formData,
    },
  );

  if (typeof response?.imageUrl !== "string" || response.imageUrl === "") {
    throw new Error("アップロード結果が不正です。");
  }
  return response.imageUrl;
}
