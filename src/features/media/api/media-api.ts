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
 * アップロード可能な画像 1 ファイルの上限バイト数。
 *
 * Backend の `spring.servlet.multipart.max-file-size`（既定 5MB / 環境変数
 * `MEDIA_MAX_FILE_SIZE` で変更可）と同じ値。Spring の `DataSize` は MB を
 * 1024*1024 として解釈するため、ここでも 2 進接頭辞で揃える。
 *
 * Backend 側の上限が変わったらこの値も追随させる（超過分は 413 で弾かれる）。
 */
export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

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
