import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { isApiError, isNetworkError } from "../../../api";
import {
  Button,
  Card,
  ChatIcon,
  PinIcon,
  Spinner,
  StarRating,
  UserPlusIcon,
  UsersIcon,
  type SvgProps,
} from "../../../components";
import { formatDateTime } from "../../../lib/date";
import { ROUTES } from "../../../routes/paths";
import type { DashboardStats, PeriodCount } from "../../../types";
import { useDashboardStats } from "../hooks/useDashboard";
import styles from "./DashboardScreen.module.css";

type StatKey = "users" | "spots" | "reviews" | "new-users";

/** 指標カードごとのアイコンと配色。tint は tokens に無い色のためリテラル。 */
const STAT_STYLES: Record<
  StatKey,
  { Icon: ComponentType<SvgProps>; color: string; tint: string }
> = {
  users: { Icon: UsersIcon, color: "var(--color-primary)", tint: "#E6F0FB" },
  spots: { Icon: PinIcon, color: "var(--color-warning)", tint: "#FEF1E0" },
  reviews: { Icon: ChatIcon, color: "var(--color-operator)", tint: "#E4F1E5" },
  "new-users": { Icon: UserPlusIcon, color: "#7C3AED", tint: "#EFE7FB" },
};

/** 順位バッジの色（金・銀・銅・以降グレー）。 */
const RANK_COLORS = ["#F39C12", "#94A3B8", "#B45309", "#CBD5E1", "#CBD5E1"];

type Stat = {
  key: StatKey;
  label: string;
  value: number;
  /** 値の右に添える増減。無い場合は出さない。 */
  delta: Delta | null;
  /** カードから遷移する一覧画面。 */
  to: string;
};

type Delta = {
  text: string;
  /** 減少は色を変える。増減なし・件数表記は中立扱い。 */
  tone: "up" | "down" | "neutral";
};

/**
 * 総数カードには「今月の増加分」を添える。
 *
 * 総数の前月比（率）は出さない。母数が大きくなるほど率が 0% に張り付いて
 * 変化が読めなくなるうえ、運営が知りたいのは「今月どれだけ増えたか」のため。
 */
function monthlyIncrease(period: PeriodCount): Delta | null {
  if (period.thisMonth === 0) return null;
  return { text: `今月 +${period.thisMonth.toLocaleString()}`, tone: "up" };
}

/**
 * 今月の新規件数を先月と比べる。
 *
 * 先月 0 件のときは率を出さない（0 除算になるうえ「+∞%」は情報量が無い）。
 * 比較対象が無いことを「先月 0 件」と明示して、運営が自分で判断できるようにする。
 */
function monthOverMonth(period: PeriodCount): Delta | null {
  if (period.lastMonth === 0) {
    return { text: "先月 0 件", tone: "neutral" };
  }
  const diff = period.thisMonth - period.lastMonth;
  if (diff === 0) return { text: "前月比 ±0%", tone: "neutral" };

  const rate = (diff / period.lastMonth) * 100;
  const sign = diff > 0 ? "+" : "-";
  return {
    text: `前月比 ${sign}${Math.abs(rate).toFixed(1)}%`,
    tone: diff > 0 ? "up" : "down",
  };
}

function toStats(stats: DashboardStats): Stat[] {
  return [
    {
      key: "users",
      label: "総ユーザー数",
      value: stats.totals.users,
      delta: monthlyIncrease(stats.newUsers),
      to: ROUTES.users,
    },
    {
      key: "spots",
      label: "総スポット数",
      value: stats.totals.spots,
      delta: monthlyIncrease(stats.newSpots),
      to: ROUTES.spots,
    },
    {
      key: "reviews",
      label: "総レビュー数",
      value: stats.totals.reviews,
      delta: monthlyIncrease(stats.newReviews),
      to: ROUTES.reviews,
    },
    {
      key: "new-users",
      label: "今月の新規ユーザー",
      value: stats.newUsers.thisMonth,
      delta: monthOverMonth(stats.newUsers),
      to: ROUTES.users,
    },
  ];
}

export function DashboardScreen() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useDashboardStats();

  return (
    <>
      <h1 className={styles.pageTitle}>ダッシュボード</h1>

      {isLoading ? (
        <div className={styles.stateBlock}>
          <Spinner size="lg" label="ダッシュボードを読み込み中" />
        </div>
      ) : isError ? (
        <div className={styles.errorBlock} role="alert">
          <p className={styles.errorText}>{errorMessage(error)}</p>
          <Button
            variant="secondary"
            onClick={() => void refetch()}
            loading={isFetching}
          >
            再試行
          </Button>
        </div>
      ) : data ? (
        <DashboardContent stats={data} />
      ) : null}
    </>
  );
}

function DashboardContent({ stats }: { stats: DashboardStats }) {
  return (
    <>
      <div className={styles.statGrid}>
        {toStats(stats).map((stat) => {
          const { Icon, color, tint } = STAT_STYLES[stat.key];
          return (
            <Link key={stat.key} to={stat.to} className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: tint }}>
                <Icon size={22} color={color} />
              </div>
              <div>
                <div className={styles.statLabel}>{stat.label}</div>
                <div className={styles.statValue}>
                  {stat.value.toLocaleString()}{" "}
                  {stat.delta && (
                    <span className={deltaClass(stat.delta.tone)}>
                      {stat.delta.text}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className={styles.panels}>
        <Card
          title={
            <PanelTitle title="人気スポット Top 5（レビュー数）" to={ROUTES.spots} />
          }
        >
          {stats.popularSpots.length === 0 ? (
            <p className={styles.empty}>レビューが投稿されたスポットはまだありません。</p>
          ) : (
            <div className={styles.rankList}>
              {stats.popularSpots.map((spot, index) => (
                <div key={spot.spotId} className={styles.rankRow}>
                  <span
                    className={styles.rankBadge}
                    style={{ background: RANK_COLORS[index] ?? "#CBD5E1" }}
                  >
                    {index + 1}
                  </span>
                  <span className={styles.rankName}>{spot.name}</span>
                  <span className={styles.rankCount}>
                    {spot.reviewCount.toLocaleString()} 件
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title={
            <PanelTitle title="最近のレビュー投稿（直近5件）" to={ROUTES.reviews} />
          }
        >
          {stats.recentReviews.length === 0 ? (
            <p className={styles.empty}>レビューはまだありません。</p>
          ) : (
            <div className={styles.recentList}>
              {stats.recentReviews.map((review) => (
                <div key={review.id} className={styles.recentRow}>
                  <span className={styles.recentAt}>
                    {formatDateTime(review.postedAt)}
                  </span>
                  <span className={styles.recentWho}>{review.authorName}</span>
                  <span className={styles.recentWhat}>
                    <span className={styles.recentSpot}>{review.spotName}</span>
                    <StarRating rating={review.rating.value} />
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

/** パネル見出し。右側に対応する一覧画面への導線を置く。 */
function PanelTitle({ title, to }: { title: string; to: string }) {
  return (
    <span className={styles.panelTitle}>
      {title}
      <Link to={to} className={styles.panelLink}>
        一覧を見る
      </Link>
    </span>
  );
}

function deltaClass(tone: Delta["tone"]): string {
  if (tone === "down") return `${styles.statDelta} ${styles.statDeltaDown}`;
  if (tone === "neutral")
    return `${styles.statDelta} ${styles.statDeltaNeutral}`;
  return styles.statDelta;
}

/** 取得失敗の例外をユーザー向け文言に変換する（Backend の生メッセージは出さない）。 */
function errorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.isUnauthorized) {
      return "ログインが必要です。再度ログインしてください。";
    }
    // 統計 API は運営ロール限定。権限変更直後などに起こりうる。
    if (error.isForbidden) {
      return "ダッシュボードを表示する権限がありません。";
    }
  }
  if (isNetworkError(error)) {
    return error.message;
  }
  return "ダッシュボードの取得に失敗しました。時間をおいて再度お試しください。";
}
