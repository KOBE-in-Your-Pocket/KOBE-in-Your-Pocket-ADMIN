import { useCallback, useEffect, useRef, useState } from "react";
import { isApiError, isNetworkError } from "../../../api";
import type { ReviewReportGroup } from "../../../types";
import { type ReportAction, UNDO_DELAY_MS } from "../api/report-constants";
import { useDeleteReportedReview, useHandleReviewReports } from "./useReviewReports";

export type ScheduledAction = {
  group: ReviewReportGroup;
  action: ReportAction;
};

/**
 * 承認・拒否・削除を、取り消し猶予つきで実行する。
 *
 * Backend は対応済みの通報を未対応へ戻せず、口コミの削除は復元もできない。そこで
 * 押した直後は API を送らず [UNDO_DELAY_MS] だけ待ち、その間なら [undo] で無かったことにできる。
 *
 * - 猶予中に別の操作を予約したら、先の操作はその場で確定する（同時に保留するのは 1 件だけ）
 * - 猶予中に画面を離れても操作は捨てずに確定する（押した操作が黙って消える方が危ない）
 */
export function useUndoableReportAction() {
  const handleReports = useHandleReviewReports();
  const deleteReview = useDeleteReportedReview();

  const [scheduled, setScheduled] = useState<ScheduledAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // アンマウント時の確定でも最新の値を使うため ref でも持つ。
  const scheduledRef = useRef<ScheduledAction | null>(null);

  const commit = useCallback(
    ({ group, action }: ScheduledAction) => {
      const onError = (e: unknown) => setError(actionErrorMessage(e));
      if (action === "DELETE_REVIEW") {
        deleteReview.mutate(group.reviewId, { onError });
      } else {
        handleReports.mutate({ reviewId: group.reviewId, decision: action }, { onError });
      }
    },
    [deleteReview, handleReports],
  );
  const commitRef = useRef(commit);
  commitRef.current = commit;

  const clear = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = null;
    scheduledRef.current = null;
    setScheduled(null);
  }, []);

  /** 保留中の操作があれば、猶予を待たずに確定する。 */
  const flush = useCallback(() => {
    const current = scheduledRef.current;
    if (current === null) return;
    clear();
    commitRef.current(current);
  }, [clear]);

  const schedule = useCallback(
    (item: ScheduledAction) => {
      flush();
      setError(null);
      scheduledRef.current = item;
      setScheduled(item);
      timerRef.current = setTimeout(flush, UNDO_DELAY_MS);
    },
    [flush],
  );

  useEffect(() => flush, [flush]);

  return {
    /** 取り消し猶予中の操作。 */
    scheduled,
    schedule,
    undo: clear,
    /** 猶予を待たずに今すぐ確定する。 */
    flush,
    error,
    clearError: () => setError(null),
  };
}

const FALLBACK_ERROR = "通報の対応に失敗しました。時間をおいて再度お試しください。";

/** 失敗した操作をユーザー向け文言にする（Backend の生メッセージは出さない）。 */
function actionErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.isUnauthorized) return "ログインが必要です。再度ログインしてください。";
    if (error.isForbidden) return "通報に対応する権限がありません。";
    // 他の運営者が先に口コミを削除した場合など。一覧は再取得される。
    if (error.status === 404) return "対象の口コミ・通報が見つかりませんでした。";
    return FALLBACK_ERROR;
  }
  if (isNetworkError(error)) return error.message;
  // mock は Error に画面向けの文言を入れて投げる
  if (error instanceof Error && error.message) return error.message;
  return FALLBACK_ERROR;
}
