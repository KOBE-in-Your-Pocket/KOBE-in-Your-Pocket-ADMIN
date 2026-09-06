import { useMemo, useState } from "react";
import {
  Button,
  Card,
  type Column,
  ConfirmDialog,
  SearchInput,
  Table,
} from "../../../components";
import type { Genre, LangKey } from "../../../types";
import { useSpots } from "../../spots";
import { GenreFormModal } from "../components/GenreFormModal";
import {
  useCreateGenre,
  useDeleteGenre,
  useGenres,
  useUpdateGenre,
} from "../hooks/useGenres";
import styles from "./GenreListScreen.module.css";

/**
 * 日本語以外の表示名の列。
 *
 * 日本語は行の見出しとして別に置く（他の一覧画面と同じく、primary 列は人が読む名前）。
 */
const SUB_LANGS: { key: LangKey; header: string }[] = [
  { key: "en", header: "English" },
  { key: "ko", header: "한국어" },
  { key: "zh", header: "中文" },
];

export function GenreListScreen() {
  const { data: genres, isLoading, isError } = useGenres();

  // スポット件数は実 API から集計する。ジャンルは mock でも、
  // 「どのジャンルが実際に使われているか」は実データで判断したいため。
  // 一覧画面と同じ query key なのでキャッシュを共有する。
  const {
    data: spots,
    isLoading: isSpotsLoading,
    isError: isSpotsError,
    isFetching: isSpotsFetching,
    refetch: refetchSpots,
  } = useSpots();

  const createGenre = useCreateGenre();
  const updateGenre = useUpdateGenre();
  const deleteGenre = useDeleteGenre();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Genre | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Genre | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /**
   * ジャンルコードごとのスポット件数。**取得できていないときは null**。
   *
   * 未取得を 0 件として扱わない。0 は「使われていないので消してよい」という
   * 判断に直結するため、通信エラーで一律 0 になると削除を誤らせる。
   * 分からないことは分からないと出す。
   */
  const spotCounts = useMemo(() => {
    if (spots === undefined) return null;

    const counts = new Map<string, number>();
    spots.forEach((spot) => {
      counts.set(spot.genre, (counts.get(spot.genre) ?? 0) + 1);
    });
    return counts;
  }, [spots]);

  // 全言語の表示名とコードを対象に絞り込む。運営は日本語でも英語でも探すため。
  const keyword = useMemo(() => search.trim().toLowerCase(), [search]);
  const filtered = useMemo(
    () =>
      (genres ?? []).filter((genre) => {
        if (keyword === "") return true;
        const haystack = [genre.code, ...Object.values(genre.labels)]
          .join(" ")
          .toLowerCase();
        return haystack.includes(keyword);
      }),
    [genres, keyword],
  );

  const columns: Column<Genre>[] = [
    {
      key: "ja",
      header: "日本語",
      primary: true,
      /*
        コードは列にせず日本語名に添える。運営が決める値ではなく（Backend が
        English の slug から採番する）普段の操作でも使わないため、行の見出しには
        しない。ただし Backend のデータに入っているのはこの値で、保存エラーも
        この値を指すため、確認できる場所は一覧に残す。
      */
      cell: (genre: Genre) => (
        <>
          {genre.labels.ja}
          <span className={styles.code}>{genre.code}</span>
        </>
      ),
    },
    ...SUB_LANGS.map(({ key, header }) => ({
      key,
      header,
      cell: (genre: Genre) => genre.labels[key],
    })),
    {
      key: "spots",
      header: "スポット数",
      align: "end" as const,
      cell: (genre: Genre) => {
        // 取得中と取得失敗を 0 件と区別する。0 は「消してよい」と読めてしまうため。
        if (spotCounts === null) {
          return (
            <span className={styles.unknownCount} title={spotCountHint()}>
              {isSpotsLoading ? "…" : "不明"}
            </span>
          );
        }

        const count = spotCounts.get(genre.code) ?? 0;
        // 0 件は「使われていない」ことが分かるよう淡色にする。削除の判断材料になる。
        return (
          <span className={count === 0 ? styles.zeroCount : undefined}>
            {count}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "操作",
      align: "end",
      cell: (genre: Genre) => (
        <div className={styles.rowActions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setFormError(null);
              setEditing(genre);
            }}
          >
            編集
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setDeleteError(null);
              setDeleteTarget(genre);
            }}
          >
            削除
          </Button>
        </div>
      ),
    },
  ];

  const closeForm = () => {
    setIsAdding(false);
    setEditing(null);
    setFormError(null);
  };

  // コードは Backend が labels.en の slug から決めるため、追加時も送らない。
  const onSubmit = (labels: Genre["labels"]) => {
    setFormError(null);
    const onError = (error: unknown) => setFormError(errorMessage(error));

    if (editing) {
      updateGenre.mutate(
        { code: editing.code, labels },
        { onSuccess: closeForm, onError },
      );
      return;
    }
    createGenre.mutate({ labels }, { onSuccess: closeForm, onError });
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteGenre.mutate(deleteTarget.code, {
      onSuccess: () => setDeleteTarget(null),
      onError: (error) => setDeleteError(errorMessage(error)),
    });
  };

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>ジャンル</h1>
        <Button
          onClick={() => {
            setFormError(null);
            setIsAdding(true);
          }}
        >
          ジャンルを追加
        </Button>
      </div>

      <p className={styles.note}>
        スポットの絞り込みに使う区分です。表示名は Client
        アプリのジャンルフィルタにも使われます。
      </p>

      <Card>
        <div className={styles.toolbar}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="表示名・コードで検索"
            aria-label="ジャンルを表示名・コードで検索"
            maxWidth={300}
          />
        </div>

        {deleteError && (
          <div className={styles.errorBlock} role="alert">
            {deleteError}
          </div>
        )}

        {/*
          スポット一覧が取れないと件数が出せない。ジャンル自体は操作できるので
          画面は止めないが、削除の判断材料が欠けていることは明示して再試行させる。
        */}
        {isSpotsError && (
          <div className={styles.warningBlock} role="status">
            <span>{spotCountHint()}</span>
            <Button
              variant="secondary"
              size="sm"
              loading={isSpotsFetching}
              onClick={() => void refetchSpots()}
            >
              再試行
            </Button>
          </div>
        )}

        {isError ? (
          <div className={styles.errorBlock} role="alert">
            ジャンルの取得に失敗しました。時間をおいて再度お試しください。
          </div>
        ) : (
          <Table
            columns={columns}
            data={filtered}
            rowKey={(genre) => genre.code}
            loading={isLoading}
            empty={
              genres?.length === 0
                ? "ジャンルはまだ登録されていません。"
                : "該当するジャンルがありません。"
            }
          />
        )}
      </Card>

      {(isAdding || editing) && (
        <GenreFormModal
          genre={editing ?? undefined}
          existingCodes={(genres ?? []).map((genre) => genre.code)}
          saving={createGenre.isPending || updateGenre.isPending}
          error={formError}
          onSubmit={onSubmit}
          onClose={closeForm}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="ジャンルを削除しますか？"
          message={`「${deleteTarget.labels.ja}」（${deleteTarget.code}）を削除します。`}
          note={deleteNote(
            deleteTarget,
            spotCounts,
            isSpotsLoading || isSpotsFetching,
          )}
          loading={deleteGenre.isPending}
          onConfirm={onConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

/** スポット件数を出せない理由の説明。一覧のセルと警告表示で同じ文言を使う。 */
function spotCountHint(): string {
  return "スポット一覧を取得できないため、各ジャンルの使用件数を表示できません。";
}

/**
 * 削除確認の補足。件数が不明なときに「使われていません」と言わないのが要点。
 *
 * 0 件と不明を同じ扱いにすると、通信エラーのときに «影響なし» と読める文言が出て、
 * 使用中のジャンルを消してしまう。件数が確認できないことを伝えて判断を委ねる。
 */
function deleteNote(
  genre: Genre,
  spotCounts: Map<string, number> | null,
  isSpotsPending: boolean,
): string {
  if (spotCounts === null) {
    const suffix = isSpotsPending
      ? "件数の取得中です。表示されるまで待つと影響を確認できます。"
      : "一覧の「再試行」で取得し直すと影響を確認できます。";
    return `${spotCountHint()}使用中のジャンルを削除すると、そのスポットのジャンル表示が不明になります。${suffix}`;
  }

  const count = spotCounts.get(genre.code) ?? 0;
  if (count > 0) {
    return `このジャンルは ${count} 件のスポットで使われています。削除するとそのスポットのジャンル表示が不明になります。`;
  }
  return "このジャンルを使っているスポットはありません。";
}

/** mock / 実 API どちらの失敗もユーザー向け文言にする。 */
function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message !== "") return error.message;
  return "保存に失敗しました。時間をおいて再度お試しください。";
}
