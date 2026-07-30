import { useState } from "react";
import { PinIcon } from "../../../components";
import styles from "./ShelterThumbnail.module.css";

type ShelterThumbnailProps = {
  imageUrl: string;
  /** フォールバック時のアイコン色（種別別）。 */
  color: string;
  /** フォールバック時の背景色（種別別）。 */
  tint: string;
};

/**
 * 避難所のサムネイル。
 *
 * media.imageUrl の画像を表示し、URL 空・読み込み失敗時は種別色のアイコンに
 * フォールバックする。失敗した URL を保持し、URL が変われば再度画像を試行する。
 */
export function ShelterThumbnail({ imageUrl, color, tint }: ShelterThumbnailProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (imageUrl === "" || failedUrl === imageUrl) {
    return (
      <div className={styles.thumb} style={{ background: tint }}>
        <PinIcon size={18} color={color} />
      </div>
    );
  }

  return (
    <img
      className={styles.thumb}
      style={{ background: tint }}
      src={imageUrl}
      alt=""
      loading="lazy"
      onError={() => setFailedUrl(imageUrl)}
    />
  );
}
