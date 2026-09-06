import { useMemo, useState } from "react";
import { isApiError, isNetworkError } from "../../../api";
import {
  Button,
  Card,
  type Column,
  ConfirmDialog,
  SearchInput,
  Table,
} from "../../../components";
import type { Genre, GenreInput, LangKey } from "../../../types";
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
  const { data: genres, isLoading, isError, error } = useGenres();

  const createGenre = useCreateGenre();
  const updateGenre = useUpdateGenre();
  const deleteGenre = useDeleteGenre();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Genre | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Genre | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
        しない。ただし Backend のデータに入っているのはこの値なので、確認できる
        場所は一覧に残す。
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
      // 0 件は「使われていない＝削除できる」ことが分かるよう淡色にする。
      cell: (genre: Genre) => (
        <span className={genre.spotCount === 0 ? styles.zeroCount : undefined}>
          {genre.spotCount}
        </span>
      ),
    },
    {
      key: "actions",
      header: "操作",
      align: "end",
      cell: (genre: Genre) => {
        // 使用中のジャンルは Backend が 409 で拒否する。押せば必ず失敗するボタンは
        // 押させず、理由を添える（disabled 要素は title を出さないので span で包む）。
        const inUse = (genre.spotCount ?? 0) > 0;
        return (
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
            <span title={inUse ? inUseHint(genre.spotCount) : undefined}>
              <Button
                variant="danger"
                size="sm"
                disabled={inUse}
                onClick={() => {
                  setDeleteError(null);
                  setDeleteTarget(genre);
                }}
              >
                削除
              </Button>
            </span>
          </div>
        );
      },
    },
  ];

  const closeForm = () => {
    setIsAdding(false);
    setEditing(null);
    setFormError(null);
  };

  /**
   * 保存する。コードは Backend が採番するため送らない。
   *
   * `displayOrder` は ADMIN に並べ替え UI が無い一方、送らないと Backend の既定値 0 に
   * 落ちて Client のジャンルフィルタの並びが変わってしまう。編集は取得した値を維持し、
   * 追加は末尾に置く。
   */
  const onSubmit = (labels: Genre["labels"]) => {
    setFormError(null);
    const onError = (error: unknown) =>
      setFormError(saveErrorMessage(error, editing ? "edit" : "create"));

    if (editing) {
      const input: GenreInput = {
        displayOrder: editing.displayOrder,
        labels,
      };
      updateGenre.mutate(
        { code: editing.code, input },
        { onSuccess: closeForm, onError },
      );
      return;
    }
    createGenre.mutate(
      { displayOrder: nextDisplayOrder(genres), labels },
      { onSuccess: closeForm, onError },
    );
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteGenre.mutate(deleteTarget.code, {
      onSuccess: () => setDeleteTarget(null),
      onError: (error) => setDeleteError(deleteErrorMessage(error)),
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

        {isError ? (
          <div className={styles.errorBlock} role="alert">
            {loadErrorMessage(error)}
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
          note="このジャンルを使っているスポットはありません。削除すると元に戻せません。"
          loading={deleteGenre.isPending}
          onConfirm={onConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

/**
 * 追加するジャンルの並び順。既存の最後尾に置く。
 *
 * 0 を送ると先頭に割り込む。運営が意図していない位置に入るより、末尾に積む方が
 * 予想を裏切らない（並べ替え UI ができるまでの暫定）。
 */
function nextDisplayOrder(genres: Genre[] | undefined): number {
  if (genres === undefined || genres.length === 0) return 1;
  return Math.max(...genres.map((genre) => genre.displayOrder)) + 1;
}

/** 削除できない理由。件数を出して、何件付け替えれば消せるのかが分かるようにする。 */
function inUseHint(spotCount: number | null): string {
  const count = spotCount ?? 0;
  return `${count} 件のスポットで使われているため削除できません。先にそのスポットのジャンルを変更してください。`;
}

/** 一覧の取得失敗をユーザー向け文言に変換する。 */
function loadErrorMessage(error: unknown): string {
  if (isApiError(error) && error.isUnauthorized) {
    return "ログインが必要です。再度ログインしてください。";
  }
  if (isNetworkError(error)) {
    return error.message;
  }
  return "ジャンルの取得に失敗しました。時間をおいて再度お試しください。";
}

/** 保存失敗の例外をユーザー向け文言に変換する（Backend の生メッセージは出さない）。 */
function saveErrorMessage(error: unknown, mode: "create" | "edit"): string {
  const action = mode === "edit" ? "更新" : "追加";

  if (isApiError(error)) {
    if (error.isUnauthorized) {
      return "ログインが必要です。再度ログインしてください。";
    }
    // 書き込みは運営ロール限定。権限変更直後などに起こりうる。
    if (error.isForbidden) {
      return "ジャンルを編集する権限がありません。";
    }
    // 編集中に他の運営者が削除した場合。一覧は再取得されるので行も消える。
    if (error.status === 404) {
      return "このジャンルは既に削除されています。";
    }
    // 英語表示名から識別子を作れない場合（記号だけ等）。フォーム側でも弾いているが、
    // 規則が Backend と食い違ったときに黙って失敗しないよう文言を用意する。
    if (error.status === 400) {
      return "入力内容が正しくありません。English の表示名に半角英数字が含まれているか確認してください。";
    }
  }
  if (isNetworkError(error)) {
    return error.message;
  }
  return `ジャンルの${action}に失敗しました。時間をおいて再度お試しください。`;
}

/** 削除失敗の例外をユーザー向け文言に変換する。 */
function deleteErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.isUnauthorized) {
      return "ログインが必要です。再度ログインしてください。";
    }
    if (error.isForbidden) {
      return "ジャンルを削除する権限がありません。";
    }
    if (error.status === 404) {
      return "このジャンルは既に削除されています。";
    }
    // 使用中。一覧を開いた後に、そのジャンルのスポットが登録された場合に起きる
    // （件数が 0 のときしかボタンを押せないため、通常は事前に防がれている）。
    if (error.status === 409) {
      return "このジャンルはスポットで使われているため削除できません。一覧を再読み込みして件数を確認してください。";
    }
  }
  if (isNetworkError(error)) {
    return error.message;
  }
  return "ジャンルの削除に失敗しました。時間をおいて再度お試しください。";
}
