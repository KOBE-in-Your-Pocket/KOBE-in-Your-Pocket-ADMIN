import { useMemo, useState } from "react";
import {
  Card,
  type Column,
  EmptyBoxIcon,
  Pagination,
  SearchInput,
  Table,
} from "../../../components";
import { DEFAULT_PAGE_SIZE } from "../../../lib/constants";
import {
  SHELTER_TYPES,
  type EvacuationShelter,
  type ShelterListMeta,
  type ShelterType,
} from "../../../types";
import { ShelterThumbnail } from "../components/ShelterThumbnail";
import { useShelters } from "../hooks/useShelters";
import styles from "./ShelterListScreen.module.css";

/** 避難所種別の表示ラベル。 */
const TYPE_LABELS: Record<ShelterType, string> = {
  "designated-emergency-evacuation-site": "指定緊急避難場所",
  "designated-evacuation-shelter": "指定避難所",
  "dual-use": "兼用",
};

/** 種別別のサムネイル配色（API はサムネ色を返さないため画面側で補う）。 */
const TYPE_COLORS: Record<ShelterType, { color: string; tint: string }> = {
  "designated-emergency-evacuation-site": { color: "#DC2626", tint: "#FBE5E5" },
  "designated-evacuation-shelter": { color: "#2E7D32", tint: "#E4F1E5" },
  "dual-use": { color: "#B45309", tint: "#F6ECDE" },
};
const DEFAULT_TYPE_COLOR = { color: "#64748B", tint: "#F1F5F9" };

function typeLabel(type: string): string {
  return TYPE_LABELS[type as ShelterType] ?? type;
}

/** meta（出典・基準日）を1行の説明にする。 */
function metaCaption(meta: ShelterListMeta): string {
  return `出典: ${meta.source}（データ基準日: ${meta.asOf}）`;
}

export function ShelterListScreen() {
  const { data, isLoading, isError } = useShelters();

  const [search, setSearch] = useState("");
  const [type, setType] = useState<ShelterType | "all">("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      (data?.data ?? []).filter(
        (s) =>
          (type === "all" || s.type === type) &&
          (search === "" || s.name.includes(search)),
      ),
    [data, type, search],
  );

  const totalPages = Math.ceil(filtered.length / DEFAULT_PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const pageItems = filtered.slice(
    (currentPage - 1) * DEFAULT_PAGE_SIZE,
    currentPage * DEFAULT_PAGE_SIZE,
  );

  const columns: Column<EvacuationShelter>[] = [
    {
      key: "thumb",
      header: "サムネイル",
      headerLabel: "サムネイル",
      cell: (s) => {
        const { color, tint } =
          TYPE_COLORS[s.type as ShelterType] ?? DEFAULT_TYPE_COLOR;
        return (
          <ShelterThumbnail
            imageUrl={s.media.imageUrl}
            color={color}
            tint={tint}
          />
        );
      },
    },
    { key: "name", header: "名称", primary: true },
    { key: "type", header: "種別", cell: (s) => typeLabel(s.type) },
    { key: "facilityCategory", header: "施設種別" },
    { key: "address", header: "住所" },
    {
      key: "capacity",
      header: "収容人数",
      align: "end",
      cell: (s) => (s.capacity !== undefined ? s.capacity.toLocaleString() : "－"),
    },
    {
      key: "accessible",
      header: "バリアフリー",
      align: "center",
      cell: (s) => (s.accessible ? "対応" : "－"),
    },
  ];

  return (
    <>
      <h1 className={styles.pageTitle}>避難所一覧</h1>
      {data !== undefined && (
        <p className={styles.meta}>{metaCaption(data.meta)}</p>
      )}

      <Card>
        <div className={styles.filters}>
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="名称で検索"
            aria-label="避難所名で検索"
          />
          <select
            className={styles.select}
            value={type}
            onChange={(e) => {
              setType(e.target.value as ShelterType | "all");
              setPage(1);
            }}
            aria-label="種別で絞り込む"
          >
            <option value="all">すべての種別</option>
            {SHELTER_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        {isError ? (
          <div className={styles.errorBlock} role="alert">
            避難所の取得に失敗しました。時間をおいて再度お試しください。
          </div>
        ) : isLoading ? (
          <Table columns={columns} data={[]} rowKey={(s) => s.id} loading />
        ) : filtered.length > 0 ? (
          <>
            <Table columns={columns} data={pageItems} rowKey={(s) => s.id} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        ) : (
          <div className={styles.empty}>
            <EmptyBoxIcon size={46} />
            <div className={styles.emptyTitle}>避難所がありません</div>
            <div className={styles.emptyNote}>
              条件を変えて再度お試しください。
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
