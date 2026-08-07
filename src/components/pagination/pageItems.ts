export type PageItem = number | "ellipsis-start" | "ellipsis-end";

/**
 * 表示するページ番号と省略記号の並びを組み立てる。
 *
 * 先頭・末尾・現在ページ周辺（±siblings）を残し、間を "…" に畳む。
 * 例（current=5, total=10, siblings=1）: 1 … 4 5 6 … 10
 */
export function pageItems(
  current: number,
  total: number,
  siblings = 1,
): PageItem[] {
  // 端の 1 ページ + 省略記号 + 現在周辺 を全部出しても収まるなら省略しない
  const totalSlots = siblings * 2 + 5;
  if (total <= totalSlots) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, total);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < total - 1;

  const items: PageItem[] = [1];

  if (showLeftEllipsis) {
    items.push("ellipsis-start");
  } else {
    // 省略しないなら 2..left-1 を並べる
    for (let p = 2; p < left; p++) items.push(p);
  }

  for (let p = left; p <= right; p++) {
    if (p !== 1 && p !== total) items.push(p);
  }

  if (showRightEllipsis) {
    items.push("ellipsis-end");
  } else {
    for (let p = right + 1; p < total; p++) items.push(p);
  }

  items.push(total);
  return items;
}
