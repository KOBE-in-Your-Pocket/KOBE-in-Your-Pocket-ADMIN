import { useState } from "react";
import styles from "./UserAvatar.module.css";

/**
 * 頭文字アバターの配色。実 API は色を返さないため画面側で補う。
 *
 * 色に意味は無く、一覧で行を見分けやすくするためだけのもの。
 * ただし白文字を重ねるため、**全色が WCAG AA（4.5:1）を満たす**必要がある。
 * 色を足すときはコントラスト比を確認すること（現状は 4.95〜8.31:1）。
 */
const COLORS = [
  "#2E7D32",
  "#1E5AA7",
  "#C2410C",
  "#7C3AED",
  "#B91C1C",
  "#0E7C86",
  "#B45309",
];

/**
 * id から配色を決める。
 *
 * 同じユーザーには常に同じ色を出したいので、乱数ではなく id のハッシュから選ぶ
 * （再取得や再描画で色が変わるとリストが不安定に見える）。
 */
function colorOf(id: string): string {
  let hash = 0;
  for (const char of id) {
    hash = (hash * 31 + char.codePointAt(0)!) % 1_000_000_007;
  }
  return COLORS[hash % COLORS.length];
}

/**
 * 表示名の先頭 1 文字。
 *
 * `name[0]` ではなく `Array.from` を使うのは、絵文字や一部の漢字がサロゲートペアで
 * 表現され、先頭 1 code unit だけ取ると文字が壊れるため。
 */
function initialOf(name: string): string {
  return Array.from(name)[0] ?? "?";
}

export type UserAvatarProps = {
  id: string;
  name: string;
  /** 未設定時は null（Backend は空文字を null にして返す）。 */
  iconUrl: string | null;
};

/**
 * ユーザーのアイコン。
 *
 * `iconUrl` があれば画像、無い・読み込み失敗時は頭文字にフォールバックする
 * （[SpotThumbnail][../../spots/components/SpotThumbnail] と同じ考え方）。
 */
export function UserAvatar({ id, name, iconUrl }: UserAvatarProps) {
  // 失敗した URL 自体を保持する。boolean だと再取得で iconUrl が変わっても
  // フォールバックが残るため、URL が変われば再度画像を試行する。
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (iconUrl === null || iconUrl === "" || failedUrl === iconUrl) {
    return (
      <div className={styles.avatar} style={{ background: colorOf(id) }}>
        {initialOf(name)}
      </div>
    );
  }

  return (
    <img
      className={styles.avatar}
      src={iconUrl}
      alt=""
      loading="lazy"
      onError={() => setFailedUrl(iconUrl)}
    />
  );
}
