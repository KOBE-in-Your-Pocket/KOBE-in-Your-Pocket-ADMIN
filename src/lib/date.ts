/**
 * ISO 8601 の日時文字列を一覧表示用の `YYYY/MM/DD` にする。
 *
 * 端末のタイムゾーンで解釈する（運営は日本国内で使う前提）。
 * 解釈できない値はそのまま返す。日付欄が空になるより、届いた値が見えた方が原因を追いやすい。
 */
export function formatDate(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return isoDateTime;

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
}

/**
 * ISO 8601 の日時文字列を `YYYY/MM/DD HH:mm` にする。
 *
 * 「いつ投稿されたか」を分単位で見せたい箇所（ダッシュボードの直近一覧）で使う。
 * タイムゾーン・解釈できない値の扱いは [formatDate] と同じ。
 */
export function formatDateTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return isoDateTime;

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${formatDate(isoDateTime)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
