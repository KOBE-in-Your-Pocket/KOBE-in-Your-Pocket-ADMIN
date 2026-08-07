import { useMutation } from "@tanstack/react-query";
import { uploadImage } from "../api/media-api";

/**
 * 画像をアップロードして公開 URL を得る（POST /api/v1/media/uploads）。
 *
 * 一覧等のキャッシュには影響しないため invalidate はしない。呼び出し側は
 * 成功時に返る URL をフォームの imageUrl に設定する。
 */
export function useUploadImage() {
  return useMutation({
    mutationFn: uploadImage,
  });
}
