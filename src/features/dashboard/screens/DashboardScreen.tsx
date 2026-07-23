import type { ComponentType } from "react";
import {
  Card,
  ChatIcon,
  PinIcon,
  UserPlusIcon,
  UsersIcon,
  type SvgProps,
} from "../../../components";
import {
  MOCK_POPULAR_SPOTS,
  MOCK_RECENT_ACTIONS,
  MOCK_STATS,
  type StatKey,
} from "../mock-dashboard";
import styles from "./DashboardScreen.module.css";

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

export function DashboardScreen() {
  return (
    <>
      <h1 className={styles.pageTitle}>ダッシュボード</h1>

      <div className={styles.statGrid}>
        {MOCK_STATS.map((stat) => {
          const { Icon, color, tint } = STAT_STYLES[stat.key];
          return (
            <div key={stat.key} className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: tint }}>
                <Icon size={22} color={color} />
              </div>
              <div>
                <div className={styles.statLabel}>{stat.label}</div>
                <div className={styles.statValue}>
                  {stat.value}{" "}
                  <span className={styles.statDelta}>{stat.delta}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.panels}>
        <Card title="人気スポット Top 5（レビュー数）">
          <div className={styles.rankList}>
            {MOCK_POPULAR_SPOTS.map((spot) => (
              <div key={spot.rank} className={styles.rankRow}>
                <span
                  className={styles.rankBadge}
                  style={{ background: spot.color }}
                >
                  {spot.rank}
                </span>
                <span className={styles.rankName}>{spot.name}</span>
                <span className={styles.rankCount}>{spot.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="最近の操作（直近5件）">
          <div className={styles.actionList}>
            {MOCK_RECENT_ACTIONS.map((action) => (
              <div
                key={`${action.at}-${action.what}`}
                className={styles.actionRow}
              >
                <span className={styles.actionAt}>{action.at}</span>
                <span className={styles.actionWho}>{action.who}</span>
                <span className={styles.actionWhat}>{action.what}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
