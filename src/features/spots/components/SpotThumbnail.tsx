import { useState } from "react";
import { PinIcon } from "../../../components";
import styles from "./SpotThumbnail.module.css";

type SpotThumbnailProps = {
  imageUrl: string;
  /** フォールバック時のアイコン色（ジャンル別）。 */
  color: string;
  /** フォールバック時の背景色（ジャンル別）。 */
  tint: string;
};

/**
 * スポットのサムネイル。
 *
 * media.imageUrl の画像を表示し、URL 空・読み込み失敗時はジャンル色のアイコンに
 * フォールバックする（現状のシードは example.com のダミー URL なので概ねフォールバック）。
 */
export function SpotThumbnail({ imageUrl, color, tint }: SpotThumbnailProps) {
  const [failed, setFailed] = useState(false);

  if (imageUrl === "" || failed) {
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
      onError={() => setFailed(true)}
    />
  );
}
