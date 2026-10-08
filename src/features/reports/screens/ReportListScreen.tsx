import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  type Column,
  ConfirmDialog,
  Pagination,
  Table,
} from "../../../components";
import { DEFAULT_PAGE_SIZE } from "../../../lib/constants";
import { formatDate, formatDateTime } from "../../../lib/date";
import type { ReviewReportGroup } from "../../../types";
import {
  ACTION_LABELS,
  type ReportAction,
  STATUS_FILTERS,
  type StatusFilter,
  UNDO_DELAY_MS,
  canDeleteAfterDismiss,
  groupStatus,
  reasonLabel,
} from "../api/report-constants";
import { ReportDetailModal } from "../components/ReportDetailModal";
import { ReportStatusBadge } from "../components/ReportStatusBadge";
import { UndoToast } from "../components/UndoToast";
import { useReviewReports } from "../hooks/useReviewReports";
import {
  type ScheduledAction,
  useUndoableReportAction,
} from "../hooks/useUndoableReportAction";
import styles from "./ReportListScreen.module.css";

/**
 * 口コミへの通報を、口コミ単位で承認・拒否する画面。
 *
 * Backend と同じく「その状態の通報が 1 件以上ある口コミ」で絞り込む。
 * 承認・拒否は口コミへの**未対応の通報をまとめて**閉じる。
 *
 * 押し間違いへの備え（Backend は対応済みを戻せない。承認するとアプリで非表示になり、削除は復元できない）:
 * - 承認・削除は確認ダイアログを挟む。拒否はアプリの表示が変わらないため挟まない
 * - どの操作も確定前に数秒の取り消し猶予を置く（useUndoableReportAction）
 * - 誤って拒否した口コミは、拒否済みの行から後で削除できる
 */
export function ReportListScreen() {
  const { data, isLoading, isError } = useReviewReports();
  const { scheduled, schedule, undo, error: actionError } = useUndoableReportAction();

  const [status, setStatus] = useState<StatusFilter>("OPEN");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<ReviewReportGroup | null>(null);
  /** 確認ダイアログで確定待ちの操作。 */
  const [confirming, setConfirming] = useState<ScheduledAction | null>(null);

  const groups = data?.data;

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      all: 0,
      OPEN: 0,
      APPROVED: 0,
      REJECTED: 0,
    };
    for (const g of groups ?? []) {
      result.all += 1;
      for (const s of ["OPEN", "APPROVED", "REJECTED"] as const) {
        if (g.reports.some((r) => r.status === s)) result[s] += 1;
      }
    }
    return result;
  }, [groups]);

  const filtered = useMemo(
    () =>
      (groups ?? []).filter(
        (g) => status === "all" || g.reports.some((r) => r.status === status),
      ),
    [groups, status],
  );

  const totalPages = Math.ceil(filtered.length / DEFAULT_PAGE_SIZE);
  // 対応で「未対応」から外れると件数が減るため、有効範囲へ丸める。
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const pageItems = filtered.slice(
    (currentPage - 1) * DEFAULT_PAGE_SIZE,
    currentPage * DEFAULT_PAGE_SIZE,
  );

  const request = (group: ReviewReportGroup, action: ReportAction) => {
    setDetail(null);
    // 拒否は口コミを消さず、取り消し猶予もあるので確認を挟まない
    if (action === "REJECTED") schedule({ group, action });
    else setConfirming({ group, action });
  };

  const onConfirm = () => {
    if (!confirming) return;
    schedule(confirming);
    setConfirming(null);
  };

  const columns: Column<ReviewReportGroup>[] = [
    {
      key: "review",
      header: "口コミ",
      // 行内のボタンを承認・拒否の 2 つに絞るため、詳細は口コミのセル自体から開く
      cell: (g) => (
        <button
          type="button"
          className={styles.reviewButton}
          onClick={() => setDetail(g)}
          aria-label={`${g.review?.spotName ?? "削除済みの口コミ"}への通報の詳細を開く`}
        >
          {g.review ? (
            <>
              <span className={styles.spotName}>{g.review.spotName}</span>
              <span className={styles.comment}>{g.review.comment}</span>
            </>
          ) : (
            <span className={styles.deleted}>（削除済みの口コミ）</span>
          )}
          <span className={styles.detailHint}>詳細を見る ›</span>
        </button>
      ),
    },
    {
      key: "reasons",
      header: "通報理由",
      cell: (g) => (
        <div className={styles.reasons}>
          {Object.entries(g.reasonCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([reason, count]) => (
              <Badge key={reason} tone="danger">
                {reasonLabel(reason)}
                {count > 1 && ` ×${count}`}
              </Badge>
            ))}
        </div>
      ),
    },
    {
      key: "count",
      header: "件数",
      align: "center",
      // 未対応かどうかは状態列で分かるため、ここは合計件数だけを出す
      cell: (g) => <span className={styles.count}>{g.reportCount}件</span>,
    },
    {
      key: "latest",
      header: "最新の通報",
      cell: (g) => <span className={styles.date}>{formatDateTime(g.latestReportedAt)}</span>,
    },
    {
      key: "status",
      header: "状態",
      cell: (g) => <ReportStatusBadge status={groupStatus(g)} />,
    },
    {
      key: "actions",
      header: "操作",
      cell: (g) => {
        // 取り消し猶予中の行は、二重に操作されないようボタンを隠す
        if (scheduled?.group.reviewId === g.reviewId) {
          return <span className={styles.handledAt}>確定待ち…</span>;
        }
        if (g.openCount > 0) {
          return (
            <div className={styles.rowActions}>
              <Button
                size="sm"
                className={styles.actionButton}
                onClick={() => request(g, "APPROVED")}
              >
                {ACTION_LABELS.APPROVED}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className={styles.actionButton}
                onClick={() => request(g, "REJECTED")}
              >
                {ACTION_LABELS.REJECTED}
              </Button>
            </div>
          );
        }
        return (
          <div className={styles.handled}>
            <span className={styles.handledAt}>{handledDate(g)}</span>
            {canDeleteAfterDismiss(g) && (
              <Button size="sm" variant="secondary" onClick={() => request(g, "DELETE_REVIEW")}>
                {ACTION_LABELS.DELETE_REVIEW}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <h1 className={styles.pageTitle}>通報一覧</h1>
      <p className={styles.note}>
        承認すると口コミをアプリで非表示にし（管理画面には残ります）、拒否すると口コミをそのまま表示して通報を閉じます。押した後 {UNDO_DELAY_MS / 1000}
        秒間は取り消せます。
      </p>

      <Card>
        <div className={styles.tabs} role="group" aria-label="対応状況で絞り込む">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={status === f.value}
              className={`${styles.tab} ${status === f.value ? styles.tabActive : ""}`.trim()}
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
            >
              {f.label}
              <span className={styles.tabCount}>{counts[f.value]}</span>
            </button>
          ))}
        </div>

        {actionError && (
          <div className={styles.errorBlock} role="alert">
            {actionError}
          </div>
        )}

        {isError ? (
          <div className={styles.errorBlock} role="alert">
            通報の取得に失敗しました。時間をおいて再度お試しください。
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={pageItems}
              rowKey={(g) => g.reviewId}
              loading={isLoading}
              empty={
                status === "OPEN"
                  ? "未対応の通報はありません。"
                  : "該当する通報がありません。"
              }
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      {detail && (
        <ReportDetailModal
          group={detail}
          onAction={(action) => request(detail, action)}
          onClose={() => setDetail(null)}
        />
      )}

      {confirming && (
        <ConfirmDialog
          title={CONFIRM_TITLES[confirming.action]}
          message={confirmMessage(confirming)}
          note={confirmNote(confirming.action)}
          confirmLabel={CONFIRM_LABELS[confirming.action]}
          onConfirm={onConfirm}
          onClose={() => setConfirming(null)}
        />
      )}

      {scheduled && (
        <UndoToast
          // 別の操作に切り替わったら残り時間のバーを最初から動かし直す
          key={`${scheduled.group.reviewId}:${scheduled.action}`}
          message={toastMessage(scheduled)}
          durationMs={UNDO_DELAY_MS}
          onUndo={undo}
        />
      )}
    </>
  );
}

const CONFIRM_TITLES: Record<ReportAction, string> = {
  APPROVED: "通報を承認しますか？",
  REJECTED: "通報を拒否しますか？",
  DELETE_REVIEW: "口コミを削除しますか？",
};

const CONFIRM_LABELS: Record<ReportAction, string> = {
  APPROVED: "承認する",
  REJECTED: "拒否する",
  DELETE_REVIEW: "削除する",
};

/** 口コミを「「南京町」への deal_master さんの口コミ」の形で示す。 */
function describeReview(group: ReviewReportGroup): string {
  return group.review
    ? `「${group.review.spotName}」への ${group.review.author.name ?? "不明なユーザー"} さんの口コミ`
    : "削除済みの口コミ";
}

function confirmMessage({ group, action }: ScheduledAction): string {
  const target = describeReview(group);
  if (action === "DELETE_REVIEW") {
    return `拒否済みの${target}を削除します。通報は拒否済みのまま記録に残ります。`;
  }
  return action === "APPROVED"
    ? `${target}をアプリで非表示にし、未対応の通報 ${group.openCount} 件を承認済みにします。管理画面には残ります。`
    : `${target}は残し、未対応の通報 ${group.openCount} 件を拒否済みにします。`;
}

/** 確認ダイアログの注意書き。どの操作も確定後は戻せないが、戻せないものが操作ごとに違う。 */
function confirmNote(action: ReportAction): string {
  const undo = `押した後 ${UNDO_DELAY_MS / 1000} 秒間だけ取り消せます`;
  return action === "DELETE_REVIEW"
    ? `口コミの削除は元に戻せません（${undo}）。`
    : `承認済みを未対応に戻すことはできません（${undo}）。`;
}

function toastMessage({ group, action }: ScheduledAction): string {
  const spot = group.review ? `「${group.review.spotName}」の` : "";
  if (action === "DELETE_REVIEW") return `${spot}口コミを削除しました`;
  return `${spot}通報を${ACTION_LABELS[action]}しました`;
}

/** 対応済みの口コミについて、最後に対応した日を返す。 */
function handledDate(group: ReviewReportGroup): string {
  const latest = group.reports
    .map((r) => r.handledAt)
    .filter((at): at is string => at !== null)
    .reduce<string | null>((a, b) => (a === null || b > a ? b : a), null);
  return latest ? `${formatDate(latest)} 対応` : "対応済み";
}
