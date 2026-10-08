import { useId } from "react";
import { Badge, Button, Modal, StarRating } from "../../../components";
import { formatDateTime } from "../../../lib/date";
import { languageLabel } from "../../../lib/language";
import type { ReviewReportGroup } from "../../../types";
import {
  ACTION_LABELS,
  type ReportAction,
  canDeleteAfterDismiss,
  reasonLabel,
} from "../api/report-constants";
import styles from "./ReportDetailModal.module.css";
import { ReportStatusBadge } from "./ReportStatusBadge";

export type ReportDetailModalProps = {
  group: ReviewReportGroup;
  /** 承認・拒否・削除を選んだとき。確認ダイアログは呼び出し側が出す。 */
  onAction: (action: ReportAction) => void;
  onClose: () => void;
};

/** 通報された口コミの本文と、寄せられた通報の一覧を見せる。 */
export function ReportDetailModal({ group, onAction, onClose }: ReportDetailModalProps) {
  const titleId = useId();
  const { review } = group;

  return (
    <Modal onClose={onClose} width={600} labelledBy={titleId}>
      <h2 id={titleId} className={styles.title}>
        通報の詳細
      </h2>

      <section className={styles.review} aria-label="通報された口コミ">
        {review ? (
          <>
            <div className={styles.reviewHead}>
              <span className={styles.spotName}>{review.spotName}</span>
              <StarRating rating={review.rating} />
            </div>
            <p className={styles.comment}>{review.comment}</p>
            <p className={styles.meta}>
              {review.author.name ?? "（不明なユーザー）"} ・ {languageLabel(review.language)} ・{" "}
              {formatDateTime(review.postedAt)}
            </p>
          </>
        ) : (
          <p className={styles.deleted}>この口コミは削除済みです。</p>
        )}
      </section>

      <h3 className={styles.subTitle}>通報（{group.reportCount} 件）</h3>
      <ul className={styles.reports}>
        {group.reports.map((r) => (
          <li key={r.id} className={styles.report}>
            <div className={styles.reportHead}>
              <Badge tone="danger">{reasonLabel(r.reason)}</Badge>
              {/* 未対応は下の承認・拒否ボタンで分かるため、対応済みのときだけ出す */}
              {r.status !== "OPEN" && <ReportStatusBadge status={r.status} />}
              <span className={styles.reportMeta}>
                {r.reporter.name ?? "（不明なユーザー）"} ・ {formatDateTime(r.createdAt)}
              </span>
            </div>
            {r.description && <p className={styles.description}>{r.description}</p>}
          </li>
        ))}
      </ul>

      {group.openCount > 0 && (
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => onAction("DISMISSED")}>
            {ACTION_LABELS.DISMISSED}
          </Button>
          <Button onClick={() => onAction("RESOLVED")}>{ACTION_LABELS.RESOLVED}</Button>
        </div>
      )}

      {canDeleteAfterDismiss(group) && (
        <div className={styles.actions}>
          <span className={styles.actionNote}>
            拒否済みですが、問題があれば口コミを削除できます。
          </span>
          <Button variant="danger" onClick={() => onAction("DELETE_REVIEW")}>
            {ACTION_LABELS.DELETE_REVIEW}
          </Button>
        </div>
      )}
    </Modal>
  );
}
