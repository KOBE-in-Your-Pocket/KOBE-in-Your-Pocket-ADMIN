/**
 * 通報 feature の API シーム。**現状は mock（メモリ保持）**。
 *
 * Backend の運営向け通報 API は `feat/145-report-admin` で実装中。形はそれに合わせてあるので、
 * 実 API ができたら 3 関数の中身を `apiRequest` に差し替えるだけで画面は変更不要。
 *
 * ```
 * GET    /api/v1/reports/reviews?status=&lang=ja&size=   口コミ単位にまとめた一覧
 * PATCH  /api/v1/reports/reviews/{reviewId}  { status }   未対応の通報をまとめて閉じる
 * DELETE /api/v1/tourism/reviews/{reviewId}               口コミ削除（未対応の通報は APPROVED になる）。拒否後の救済用
 * ```
 *
 * 「承認」は口コミを**削除しない**。PATCH `APPROVED` で通報を閉じると、口コミは管理画面に残ったまま
 * アプリでは非表示になる（一般向けのレビュー取得が `hiddenByReport: true` を返す / Backend #202）。
 * 実 API 化では **承認 = PATCH `APPROVED`**、**拒否 = PATCH `REJECTED`** にする。
 */
import type {
  ReportDecision,
  ReportStatus,
  ReviewReportGroup,
  ReviewReportItem,
  ReviewReportListResponse,
} from "../../../types";

/** mock が模すネットワーク遅延（ミリ秒）。読み込み表示の確認用。 */
const MOCK_LATENCY_MS = 250;

/** mock で「対応した運営」として記録する ID。実 API では JWT の sub が入る。 */
const MOCK_HANDLER_ID = "mock-operator";

/** 集計値（件数・最新日時）を除いた、mock が保持する元データ。 */
type MockGroup = Pick<ReviewReportGroup, "reviewId" | "review" | "reports">;

function report(
  id: string,
  reason: string,
  createdAt: string,
  reporterName: string,
  description: string | null = null,
  status: ReportStatus = "OPEN",
): ReviewReportItem {
  const handled = status !== "OPEN";
  return {
    id,
    reason,
    description,
    status,
    reporter: { id: `user-${id}`, name: reporterName },
    createdAt,
    handledBy: handled ? MOCK_HANDLER_ID : null,
    handledAt: handled ? "2026-10-02T10:00:00Z" : null,
  };
}

let groups: MockGroup[] = [
  {
    reviewId: "rv-1001",
    review: {
      spotId: "kobe-port-tower",
      spotName: "神戸ポートタワー",
      rating: 1,
      comment:
        "最悪。スタッフの○○って人、態度悪すぎ。名前覚えたからSNSで晒します。",
      author: { id: "user-a1", name: "kobe_taro" },
      language: "ja",
      postedAt: "2026-10-05T09:12:00Z",
    },
    reports: [
      report("r-01", "HARASSMENT", "2026-10-05T11:20:00Z", "みなと"),
      report("r-02", "PERSONAL_INFO", "2026-10-05T13:02:00Z", "Emily"),
      report("r-03", "HARASSMENT", "2026-10-06T08:45:00Z", "さくら"),
    ],
  },
  {
    reviewId: "rv-1007",
    review: {
      spotId: "meriken-park",
      spotName: "メリケンパーク",
      rating: 1,
      comment:
        "ここに来る観光客はマナーが悪すぎる。○○人は来るな。ついでに隣に座ってたカップルの写真も載せとく（インスタ @xxxx）。",
      author: { id: "user-a7", name: "anon_7" },
      language: "ja",
      postedAt: "2026-10-06T22:10:00Z",
    },
    reports: [
      report("r-11", "HATE", "2026-10-06T22:30:00Z", "あおい"),
      report("r-12", "HATE", "2026-10-06T23:02:00Z", "Chen"),
      report("r-13", "PERSONAL_INFO", "2026-10-07T00:15:00Z", "ゆい"),
      report("r-14", "HARASSMENT", "2026-10-07T02:48:00Z", "Mark"),
      report("r-15", "HATE", "2026-10-07T05:20:00Z", "そら"),
      report(
        "r-16",
        "OTHER",
        "2026-10-07T07:41:00Z",
        "神戸市民",
        "他のスポットにも同じ人が同じ内容を投稿しています。",
      ),
      report("r-17", "PERSONAL_INFO", "2026-10-07T09:05:00Z", "Kim"),
      report("r-18", "HATE", "2026-10-07T12:33:00Z", "はると"),
    ],
  },
  {
    reviewId: "rv-1002",
    review: {
      spotId: "nankinmachi",
      spotName: "南京町",
      rating: 5,
      comment:
        "Best food! Visit my shop for 50% OFF >>> www.cheap-deal.example <<< Limited time!!!",
      author: { id: "user-a2", name: "deal_master" },
      language: "en",
      postedAt: "2026-10-06T02:30:00Z",
    },
    reports: [
      report("r-04", "SPAM", "2026-10-06T03:10:00Z", "Lee"),
      report("r-05", "SPAM", "2026-10-06T05:44:00Z", "ゆうき"),
    ],
  },
  {
    reviewId: "rv-1003",
    review: {
      spotId: "mount-rokko",
      spotName: "六甲山",
      rating: 2,
      comment: "夜景を見に行ったけど霧で何も見えなかった。天気予報ちゃんと見ればよかった。",
      author: { id: "user-a3", name: "hiker_k" },
      language: "ja",
      postedAt: "2026-10-04T12:00:00Z",
    },
    reports: [report("r-06", "MISLEADING", "2026-10-07T01:15:00Z", "ろっこう")],
  },
  {
    reviewId: "rv-1004",
    review: {
      spotId: "kitano-ijinkan",
      spotName: "北野異人館街",
      rating: 3,
      comment: "건물은 예쁜데 입장료가 너무 비싸요. 몇 군데만 보는 걸 추천합니다.",
      author: { id: "user-a4", name: "지민" },
      language: "ko",
      postedAt: "2026-10-03T06:40:00Z",
    },
    reports: [
      report(
        "r-07",
        "OTHER",
        "2026-10-07T09:30:00Z",
        "北野住民",
        "料金が古い情報のまま書かれている気がします。",
      ),
    ],
  },
  {
    reviewId: "rv-1005",
    review: {
      spotId: "harborland",
      spotName: "神戸ハーバーランド",
      rating: 4,
      comment: "海沿いの散歩が気持ちいい。観覧車からの景色もおすすめ。",
      author: { id: "user-a5", name: "umie_fan" },
      language: "ja",
      postedAt: "2026-09-28T08:00:00Z",
    },
    reports: [
      report("r-08", "SPAM", "2026-09-30T10:00:00Z", "test_user", null, "REJECTED"),
    ],
  },
  {
    reviewId: "rv-1006",
    review: null,
    reports: [
      report("r-09", "HATE", "2026-09-25T14:20:00Z", "ハル", null, "APPROVED"),
      report("r-10", "HATE", "2026-09-25T15:05:00Z", "Tom", null, "APPROVED"),
    ],
  },
];

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
}

/** Backend が返す集計値（件数・理由別件数・最新日時）を元データから組み立てる。 */
function summarize(group: MockGroup): ReviewReportGroup {
  const reasonCounts: Record<string, number> = {};
  for (const r of group.reports) {
    reasonCounts[r.reason] = (reasonCounts[r.reason] ?? 0) + 1;
  }
  return {
    reviewId: group.reviewId,
    review: group.review && { ...group.review, author: { ...group.review.author } },
    reportCount: group.reports.length,
    openCount: group.reports.filter((r) => r.status === "OPEN").length,
    reasonCounts,
    latestReportedAt: group.reports
      .map((r) => r.createdAt)
      .reduce((a, b) => (a > b ? a : b)),
    reports: group.reports.map((r) => ({ ...r, reporter: { ...r.reporter } })),
  };
}

/**
 * 通報された口コミの一覧を取得する（mock）。
 *
 * 並びは Backend と同じく「未対応の通報が多い順 → 最新の通報が新しい順」。
 * 状態での絞り込みは画面側で行う（他の一覧画面と同じく上限まで一括取得する想定）。
 */
export async function fetchReviewReports(): Promise<ReviewReportListResponse> {
  await delay();
  const data = groups
    .map(summarize)
    .sort(
      (a, b) =>
        b.openCount - a.openCount ||
        b.latestReportedAt.localeCompare(a.latestReportedAt),
    );
  return {
    data,
    meta: { page: 0, size: data.length, totalElements: data.length, totalPages: 1 },
  };
}

/**
 * 口コミへの未対応の通報にまとめて対応する（mock）。
 *
 * - `APPROVED`（承認）: 口コミは残し（アプリでは非表示）、未対応の通報を承認済みにする
 * - `REJECTED`（拒否）: 口コミは残し、未対応の通報を拒否済みにする
 *
 * 対応済みの通報は触らない（Backend と同じく担当者・日時の履歴を上書きしない）。
 */
export async function handleReviewReports(
  reviewId: string,
  decision: ReportDecision,
): Promise<void> {
  await delay();
  const target = groups.find((g) => g.reviewId === reviewId);
  if (!target) {
    throw new Error("対象の通報が見つかりませんでした。");
  }
  const handledAt = new Date().toISOString();
  groups = groups.map((g) =>
    g.reviewId !== reviewId
      ? g
      : {
          ...g,
          reports: g.reports.map((r) =>
            r.status === "OPEN"
              ? { ...r, status: decision, handledBy: MOCK_HANDLER_ID, handledAt }
              : r,
          ),
        },
  );
}

/**
 * 通報された口コミを削除する（mock）。拒否済みにした後で、やはり削除すべきだった場合に使う。
 *
 * 実 API ではレビュー削除（`DELETE /api/v1/tourism/reviews/{reviewId}`）にあたる。Backend は
 * 削除時に**未対応の**通報だけを対応済みにし、拒否済みの通報は書き換えない。mock も同じ挙動で、
 * 口コミは消えるが通報は拒否済みのまま残る（対応履歴として誰がいつ拒否したかが残る）。
 */
export async function deleteReportedReview(reviewId: string): Promise<void> {
  await delay();
  const target = groups.find((g) => g.reviewId === reviewId);
  if (!target?.review) {
    throw new Error("この口コミは既に削除されています。");
  }
  const handledAt = new Date().toISOString();
  groups = groups.map((g) =>
    g.reviewId !== reviewId
      ? g
      : {
          ...g,
          review: null,
          reports: g.reports.map((r) =>
            r.status === "OPEN"
              ? { ...r, status: "APPROVED", handledBy: MOCK_HANDLER_ID, handledAt }
              : r,
          ),
        },
  );
}
