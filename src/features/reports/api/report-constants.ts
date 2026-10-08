import type { ReportDecision, ReportStatus, ReviewReportGroup } from "../../../types";

/** 通報理由の表示ラベル（Backend `ReportReason` の KDoc に合わせた文言）。 */
const REASON_LABELS: Record<string, string> = {
  SPAM: "スパム・宣伝",
  HARASSMENT: "誹謗中傷・嫌がらせ",
  HATE: "差別的・ヘイト表現",
  SEXUAL_OR_VIOLENT: "性的・暴力的な内容",
  PERSONAL_INFO: "個人情報の掲載",
  MISLEADING: "虚偽・無関係な内容",
  OTHER: "その他",
};

/**
 * 通報理由を表示ラベルにする。
 *
 * 未知のコードはそのまま返す（Backend が理由を増やしたのに ADMIN が追随していない場合に気付ける）。
 */
export function reasonLabel(code: string): string {
  return REASON_LABELS[code] ?? code;
}

/** 状態フィルタの選択肢。`all` は絞り込み無し。 */
export type StatusFilter = ReportStatus | "all";

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "OPEN", label: "未対応" },
  { value: "RESOLVED", label: "承認済み" },
  { value: "DISMISSED", label: "拒否済み" },
  { value: "all", label: "すべて" },
];

/**
 * 運営の対応ボタンと Backend の状態の対応。
 *
 * - 承認: 通報の内容を認める。口コミを削除し、通報は `RESOLVED`
 * - 拒否: 問題なしと判断する。口コミは残し、通報は `DISMISSED`
 */
export const DECISION_LABELS: Record<ReportDecision, string> = {
  RESOLVED: "承認",
  DISMISSED: "拒否",
};

/**
 * 画面から行える操作。承認・拒否に加え、拒否済みの口コミを後から削除する操作を持つ
 * （誤って拒否した場合の救済。Backend は拒否済みを未対応へ戻せないため、口コミ削除で対応する）。
 */
export type ReportAction = ReportDecision | "DELETE_REVIEW";

export const ACTION_LABELS: Record<ReportAction, string> = {
  ...DECISION_LABELS,
  DELETE_REVIEW: "口コミを削除",
};

/** 操作を確定するまでの取り消し猶予（ミリ秒）。 */
export const UNDO_DELAY_MS = 5000;

/**
 * 口コミ単位の対応状況。
 *
 * 未対応が 1 件でも残っていれば「未対応」。すべて閉じていれば、承認が 1 件でもあるかで
 * 承認済み / 拒否済みを決める（承認＝口コミ削除なので、そちらを優先して見せる）。
 */
export function groupStatus(group: ReviewReportGroup): ReportStatus {
  if (group.openCount > 0) return "OPEN";
  return group.reports.some((r) => r.status === "RESOLVED") ? "RESOLVED" : "DISMISSED";
}

/**
 * 拒否済みの口コミを後から削除できるか（誤って拒否した場合の救済）。
 *
 * 未対応の通報が残っていれば承認で削除できるので対象外。口コミが既に無ければ削除するものが無い。
 */
export function canDeleteAfterDismiss(group: ReviewReportGroup): boolean {
  return group.openCount === 0 && group.review !== null && groupStatus(group) === "DISMISSED";
}
