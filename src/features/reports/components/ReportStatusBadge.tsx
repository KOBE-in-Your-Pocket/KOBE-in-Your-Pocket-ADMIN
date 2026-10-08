import { Badge } from "../../../components";
import type { ReportStatus } from "../../../types";

const STATUS_BADGE: Record<ReportStatus, { tone: "warning" | "success" | "primary"; label: string }> = {
  OPEN: { tone: "warning", label: "未対応" },
  APPROVED: { tone: "success", label: "承認済み" },
  REJECTED: { tone: "primary", label: "拒否済み" },
};

/** 通報 1 件の対応状況。 */
export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const { tone, label } = STATUS_BADGE[status];
  return <Badge tone={tone}>{label}</Badge>;
}
