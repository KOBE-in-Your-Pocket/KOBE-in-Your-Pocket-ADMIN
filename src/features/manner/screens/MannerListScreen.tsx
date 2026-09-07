import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  type Column,
  ConfirmDialog,
  SearchInput,
  Table,
} from "../../../components";
import {
  MANNER_KINDS,
  MANNER_SCOPES,
  type MannerItemDetail,
  type MannerItemInput,
  type MannerKind,
  type MannerScope,
} from "../../../types";
import { useSpots } from "../../spots";
import { MannerFormModal } from "../components/MannerFormModal";
import {
  iconLabel,
  isKnownIcon,
  KIND_LABELS,
  SCOPE_LABELS,
} from "../api/manner-constants";
import {
  useCreateMannerItem,
  useDeleteMannerItem,
  useMannerItems,
  useUpdateMannerItem,
} from "../hooks/useMannerItems";
import styles from "./MannerListScreen.module.css";

export function MannerListScreen() {
  const { data: items, isLoading, isError } = useMannerItems();

  // 関連スポットは ID ではなく名前で選ばせたいので、スポット一覧から引く。
  const {
    data: spots,
    isLoading: isSpotsLoading,
    isError: isSpotsError,
  } = useSpots();

  const createItem = useCreateMannerItem();
  const updateItem = useUpdateMannerItem();
  const deleteItem = useDeleteMannerItem();

  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<MannerKind | "all">("all");
  const [scopeFilter, setScopeFilter] = useState<MannerScope | "all">("all");
  const [editing, setEditing] = useState<MannerItemDetail | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MannerItemDetail | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /** 関連スポットの選択肢。**取得できていないときは null**（0 件と区別する）。 */
  const spotOptions = useMemo(() => {
    if (spots === undefined) return null;
    return spots.map((spot) => ({ id: spot.id, name: spot.name }));
  }, [spots]);

  /** ID → スポット名。一覧で関連づけを名前で見せるために使う。 */
  const spotNames = useMemo(() => {
    const names = new Map<string, string>();
    spots?.forEach((spot) => names.set(spot.id, spot.name));
    return names;
  }, [spots]);

  // 検索は全言語のタイトル・説明と ID を対象にする。運営は日本語でも英語でも探すため。
  const keyword = useMemo(() => search.trim().toLowerCase(), [search]);
  const filtered = useMemo(
    () =>
      (items ?? []).filter((item) => {
        if (kindFilter !== "all" && item.kind !== kindFilter) return false;
        if (scopeFilter !== "all" && item.scope !== scopeFilter) return false;
        if (keyword === "") return true;

        const haystack = [
          item.id,
          ...Object.values(item.localizations).flatMap((loc) => [
            loc.title,
            loc.description,
          ]),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(keyword);
      }),
    [items, kindFilter, scopeFilter, keyword],
  );

  const columns: Column<MannerItemDetail>[] = [
    {
      key: "title",
      header: "タイトル",
      primary: true,
      cell: (item) => (
        <>
          {item.localizations.ja.title}
          <span className={styles.itemId}>{item.id}</span>
        </>
      ),
    },
    {
      key: "kind",
      header: "種別",
      cell: (item) => (
        <Badge tone={item.kind === "rule" ? "warning" : "primary"}>
          {KIND_LABELS[item.kind]}
        </Badge>
      ),
    },
    {
      key: "scope",
      header: "適用範囲",
      cell: (item) => SCOPE_LABELS[item.scope],
    },
    {
      key: "icon",
      header: "アイコン",
      /*
        アップロード済みなら画像そのものを出す。運営が選ぶのは絵なので、
        キー文字列より現物の方が早い。幅は固定して、内容で列が動かないようにする。
      */
      cell: (item) =>
        item.iconUrl !== null ? (
          <span className={styles.icon}>
            <img
              className={styles.iconImage}
              src={item.iconUrl}
              alt=""
              loading="lazy"
            />
          </span>
        ) : (
          /*
            画像未設定の項目は、従来のアイコン識別キーでアプリに表示される。
            Client がそのキーの絵を持たない場合は汎用アイコンになるため、
            そこだけ警告を出す（Backend の seed（V6）8 件はすべてこれに当たる）。
          */
          <span className={styles.icon} title={item.icon}>
            <span className={styles.iconFallback}>{iconLabel(item.icon)}</span>
            {!isKnownIcon(item.icon) && (
              <span className={styles.iconWarning}>画像なし</span>
            )}
          </span>
        ),
    },
    {
      key: "spots",
      header: "関連スポット",
      cell: (item) => {
        // 名前が引けないときは ID をそのまま出す。空欄にすると関連づけ自体が
        // 無いように見えてしまう。
        const names = item.relatedSpotIds.map((id) => spotNames.get(id) ?? id);
        /*
          この列は幅を固定する（.spots）。件数によって文字数が変わるため、内容に
          合わせて伸ばすと 0 件 → 1 件 → 複数件で列幅が変わり、右隣の操作ボタンまで
          動く。0 件の行も同じ幅の器に入れて、行が増減しても揃うようにする。

          収まらないぶんは省略し、全件はホバー（title）と編集フォームで確認できる。
        */
        return (
          <span
            className={styles.spots}
            title={names.length > 0 ? names.join("\n") : undefined}
          >
            {names.length === 0 ? (
              <span className={styles.none}>—</span>
            ) : names.length === 1 ? (
              names[0]
            ) : (
              `${names[0]} 他 ${names.length - 1} 件`
            )}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "操作",
      align: "end",
      cell: (item) => (
        <div className={styles.rowActions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setFormError(null);
              setEditing(item);
            }}
          >
            編集
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setDeleteError(null);
              setDeleteTarget(item);
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

  const onSubmit = (input: MannerItemInput) => {
    setFormError(null);
    const onError = (error: unknown) => setFormError(errorMessage(error));

    if (editing) {
      updateItem.mutate(
        { id: editing.id, input },
        { onSuccess: closeForm, onError },
      );
      return;
    }
    createItem.mutate(input, { onSuccess: closeForm, onError });
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteItem.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError: (error) => setDeleteError(errorMessage(error)),
    });
  };

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>マナー</h1>
        <Button
          onClick={() => {
            setFormError(null);
            setIsAdding(true);
          }}
        >
          マナー項目を追加
        </Button>
      </div>

      <p className={styles.note}>
        アプリの「マナー」タブに出る項目です。スポットに関連づけると、そのスポットの
        詳細にも表示されます。
      </p>

      <Card>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <select
              className={styles.filter}
              value={kindFilter}
              onChange={(e) =>
                setKindFilter(e.target.value as MannerKind | "all")
              }
              aria-label="種別で絞り込む"
            >
              <option value="all">すべての種別</option>
              {MANNER_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {KIND_LABELS[kind]}
                </option>
              ))}
            </select>
            <select
              className={styles.filter}
              value={scopeFilter}
              onChange={(e) =>
                setScopeFilter(e.target.value as MannerScope | "all")
              }
              aria-label="適用範囲で絞り込む"
            >
              <option value="all">すべての範囲</option>
              {MANNER_SCOPES.map((scope) => (
                <option key={scope} value={scope}>
                  {SCOPE_LABELS[scope]}
                </option>
              ))}
            </select>
          </div>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="タイトル・説明で検索"
            aria-label="マナー項目をタイトル・説明で検索"
            maxWidth={280}
          />
        </div>

        {deleteError && (
          <div className={styles.errorBlock} role="alert">
            {deleteError}
          </div>
        )}

        {/*
          スポット一覧が取れないと関連づけの名前を出せず、フォームでも選べない。
          マナー項目そのものは編集できるので画面は止めず、状態だけ伝える。
        */}
        {isSpotsError && (
          <div className={styles.warningBlock} role="status">
            スポット一覧を取得できないため、関連スポットは ID
            のまま表示され、追加・変更ができません。
          </div>
        )}

        {isError ? (
          <div className={styles.errorBlock} role="alert">
            マナー項目の取得に失敗しました。時間をおいて再度お試しください。
          </div>
        ) : (
          <Table
            columns={columns}
            data={filtered}
            rowKey={(item) => item.id}
            loading={isLoading}
            empty={
              items?.length === 0
                ? "マナー項目はまだ登録されていません。"
                : "該当するマナー項目がありません。"
            }
          />
        )}
      </Card>

      {(isAdding || editing) && (
        <MannerFormModal
          item={editing ?? undefined}
          spotOptions={spotOptions}
          spotsLoading={isSpotsLoading}
          saving={createItem.isPending || updateItem.isPending}
          error={formError}
          onSubmit={onSubmit}
          onClose={closeForm}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="マナー項目を削除しますか？"
          message={`「${deleteTarget.localizations.ja.title}」を削除します。`}
          note={deleteNote(deleteTarget)}
          loading={deleteItem.isPending}
          onConfirm={onConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

/** 削除確認の補足。関連スポットの詳細からも消えることを伝える。 */
function deleteNote(item: MannerItemDetail): string {
  if (item.relatedSpotIds.length > 0) {
    return `${item.relatedSpotIds.length} 件のスポットに関連づけられています。削除するとそのスポットの詳細からも表示が消えます。`;
  }
  return "アプリのマナー一覧から表示が消えます。元に戻せません。";
}

/** 保存の失敗をユーザー向け文言にする。`ApiError` / `NetworkError` は message をそのまま使う。 */
function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message !== "") return error.message;
  return "保存に失敗しました。時間をおいて再度お試しください。";
}
