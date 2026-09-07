/**
 * マナー feature の API シーム。**現状は mock（メモリ保持）**。
 *
 * Backend の管理 API がまだ無い。公開 API は参照のみで、`?lang=` で 1 言語に解決した
 * 一覧を返す `GET /api/v1/manner/items` だけが存在する（追加・更新・削除は未実装）。
 *
 * 実 API ができたら、この 4 関数の中身を `apiRequest` に差し替えるだけで画面は変更不要。
 * 想定しているエンドポイントは次の形（ジャンルマスタ #153 と同じ並び）。
 *
 * ```
 * GET    /api/v1/manner/items          全言語まとめて返す（管理用）
 * POST   /api/v1/manner/items
 * PUT    /api/v1/manner/items/{id}
 * DELETE /api/v1/manner/items/{id}
 * ```
 */
import { LANG_KEYS, type MannerItemDetail, type MannerItemInput } from "../../../types";

/** mock が模すネットワーク遅延（ミリ秒）。読み込み表示の確認用。 */
const MOCK_LATENCY_MS = 250;

/**
 * 初期データ。**Backend の seed（V6__seed_manner_items.sql）をそのまま写している。**
 *
 * 神戸特有 3 件 + 日本全般 5 件の計 8 件、4 言語ぶん。実 API 化したときに画面の見え方が
 * 変わらないよう、件数も文言も本物に合わせてある。`icon` の値も seed のままなので、
 * **Client がピクトグラムを持たないキー**（hot-spring 等）が並ぶ状態も再現される。
 */
const INITIAL_ITEMS: MannerItemDetail[] = [
  {
    id: "arima-onsen-bathing",
    icon: "hot-spring",
    iconUrl: null,
    kind: "manner",
    scope: "local",
    relatedSpotIds: [],
    localizations: {
      ja: {
        title: "有馬温泉の入浴マナー",
        description:
          "日本三古湯のひとつ有馬温泉では、湯船に入る前にかけ湯で体を流し、タオルや髪を湯につけないようにしましょう。",
      },
      en: {
        title: "Arima Onsen bathing etiquette",
        description:
          "Arima is one of Japan's oldest hot springs. Rinse your body before entering the bath, and keep towels and hair out of the water.",
      },
      ko: {
        title: "아리마 온천 입욕 매너",
        description:
          "일본에서 가장 오래된 온천 중 하나인 아리마 온천에서는 탕에 들어가기 전에 몸을 헹구고, 수건과 머리카락이 물에 닿지 않도록 하세요.",
      },
      zh: {
        title: "有马温泉入浴礼仪",
        description:
          "有马温泉是日本最古老的温泉之一。入浴前请先冲净身体，并不要将毛巾或头发泡入浴池。",
      },
    },
  },
  {
    id: "rokko-nature-protection",
    icon: "mountain",
    iconUrl: null,
    kind: "manner",
    scope: "local",
    relatedSpotIds: ["mount-rokko"],
    localizations: {
      ja: {
        title: "六甲山の自然保護",
        description:
          "六甲山は市街地に近い場所に貴重な自然が残る山です。ゴミは必ず持ち帰り、動植物の採取や登山道以外への立ち入りは控えましょう。",
      },
      en: {
        title: "Protect Mount Rokko's nature",
        description:
          "Mount Rokko preserves rare nature close to the city. Take all your trash home, and refrain from picking plants or leaving the marked trails.",
      },
      ko: {
        title: "롯코산의 자연 보호",
        description:
          "롯코산은 도심과 가까운 곳에 귀중한 자연이 남아 있는 산입니다. 쓰레기는 반드시 되가져가고, 동식물 채취나 등산로 외 출입은 삼가세요.",
      },
      zh: {
        title: "保护六甲山的自然",
        description:
          "六甲山保留着邻近市区的珍贵自然环境。请务必将垃圾带走，勿采摘动植物或进入登山道以外的地方。",
      },
    },
  },
  {
    id: "nankinmachi-street-food",
    icon: "food",
    iconUrl: null,
    kind: "manner",
    scope: "local",
    relatedSpotIds: [],
    localizations: {
      ja: {
        title: "南京町の食べ歩きマナー",
        description:
          "神戸南京町は道幅が狭く混み合います。食べ歩きの際は通行の妨げにならないよう端に寄り、ゴミは各店やゴミ箱へ捨てましょう。",
      },
      en: {
        title: "Eating while walking in Nankinmachi",
        description:
          "Kobe's Nankinmachi (Chinatown) is narrow and crowded. Step to the side while eating, and dispose of trash at shops or bins.",
      },
      ko: {
        title: "난킨마치 먹거리 매너",
        description:
          "고베 난킨마치(차이나타운)는 길이 좁고 붐빕니다. 걸으며 먹을 때는 통행에 방해가 되지 않도록 가장자리로 비켜서고, 쓰레기는 가게나 쓰레기통에 버리세요.",
      },
      zh: {
        title: "南京町边走边吃的礼仪",
        description:
          "神户南京町（中华街）道路狭窄且拥挤。边走边吃时请靠边，避免妨碍通行，并将垃圾丢到店家或垃圾桶。",
      },
    },
  },
  {
    id: "no-littering",
    icon: "trash",
    iconUrl: null,
    kind: "rule",
    scope: "japan",
    relatedSpotIds: [],
    localizations: {
      ja: {
        title: "ゴミのポイ捨て禁止",
        description:
          "日本では路上のゴミ箱が少なく、ゴミは持ち帰るのが基本です。ポイ捨ては法律で罰せられることもあります。",
      },
      en: {
        title: "No littering",
        description:
          "Public bins are scarce in Japan, so please carry your trash with you. Littering can be subject to fines.",
      },
      ko: {
        title: "쓰레기 무단 투기 금지",
        description:
          "일본은 거리의 쓰레기통이 적어 쓰레기는 되가져가는 것이 기본입니다. 무단 투기는 법으로 처벌받을 수 있습니다.",
      },
      zh: {
        title: "禁止乱扔垃圾",
        description:
          "日本街头的垃圾桶很少，垃圾原则上要自行带走。乱扔垃圾可能会被处以罚款。",
      },
    },
  },
  {
    id: "train-quiet",
    icon: "train",
    iconUrl: null,
    kind: "manner",
    scope: "japan",
    relatedSpotIds: [],
    localizations: {
      ja: {
        title: "電車内は静かに",
        description:
          "電車やバスの車内では通話を控え、携帯電話はマナーモードにしましょう。優先座席付近では混雑時に電源を切ります。",
      },
      en: {
        title: "Keep quiet on trains",
        description:
          "Avoid phone calls on trains and buses and set your phone to silent. Near priority seats, switch it off when crowded.",
      },
      ko: {
        title: "전철 안에서는 조용히",
        description:
          "전철이나 버스 안에서는 통화를 삼가고 휴대폰은 매너모드로 하세요. 노약자석 부근에서는 혼잡 시 전원을 꺼 주세요.",
      },
      zh: {
        title: "在电车内保持安静",
        description:
          "在电车和巴士内请勿通话，并将手机调至静音。在优先座席附近，拥挤时请关闭手机电源。",
      },
    },
  },
  {
    id: "orderly-queue",
    icon: "users",
    iconUrl: null,
    kind: "manner",
    scope: "japan",
    relatedSpotIds: [],
    localizations: {
      ja: {
        title: "列に並んで待つ",
        description:
          "駅のホームや店舗では、割り込まずに列の最後尾に並びます。電車を待つ際は降りる人を先に通しましょう。",
      },
      en: {
        title: "Wait in an orderly line",
        description:
          "Line up at the back without cutting in, whether on platforms or at shops. Let passengers off the train before boarding.",
      },
      ko: {
        title: "줄을 서서 기다리기",
        description:
          "역 승강장이나 상점에서는 새치기하지 말고 줄 맨 뒤에 서세요. 전철을 탈 때는 내리는 사람을 먼저 보내 주세요.",
      },
      zh: {
        title: "排队等候",
        description:
          "在站台或店铺请勿插队，到队伍最后排队。等电车时请先让下车的人通过。",
      },
    },
  },
  {
    id: "shrine-temple-etiquette",
    icon: "torii",
    iconUrl: null,
    kind: "manner",
    scope: "japan",
    relatedSpotIds: [],
    localizations: {
      ja: {
        title: "神社・寺院での作法",
        description:
          "参道の中央は神様の通り道とされるため端を歩き、手水舎で手と口を清めてから参拝しましょう。撮影禁止の場所では従ってください。",
      },
      en: {
        title: "Shrine and temple etiquette",
        description:
          "Walk to the side of the path, purify your hands and mouth at the water basin before praying, and obey no-photography signs.",
      },
      ko: {
        title: "신사·사찰에서의 예절",
        description:
          "참배로 중앙은 신의 길로 여겨지므로 가장자리로 걷고, 데미즈야에서 손과 입을 씻은 뒤 참배하세요. 촬영 금지 장소에서는 이를 따르세요.",
      },
      zh: {
        title: "神社与寺院的礼仪",
        description:
          "参道中央被视为神明通行之路，请靠边行走，并在手水舍净手漱口后再参拜。在禁止拍照的场所请遵守规定。",
      },
    },
  },
  {
    id: "no-tipping",
    icon: "coin-off",
    iconUrl: null,
    kind: "manner",
    scope: "japan",
    relatedSpotIds: [],
    localizations: {
      ja: {
        title: "チップは不要",
        description:
          "日本にはチップの習慣がなく、料金には基本的にサービス料が含まれています。無理に渡すと断られることがあります。",
      },
      en: {
        title: "No tipping needed",
        description:
          "Tipping is not customary in Japan, and service is generally included in the price. Staff may politely decline tips.",
      },
      ko: {
        title: "팁은 필요 없습니다",
        description:
          "일본에는 팁 문화가 없으며 요금에 기본적으로 서비스 요금이 포함되어 있습니다. 억지로 건네면 정중히 거절당할 수 있습니다.",
      },
      zh: {
        title: "无需支付小费",
        description:
          "日本没有付小费的习惯，费用中通常已包含服务费。勉强给小费有时会被婉拒。",
      },
    },
  },
];

/**
 * mock の保持先。モジュールスコープのため**リロードで初期値に戻る**。
 *
 * 実 API 化までの暫定。追加・編集・削除が一覧に反映される様子を確認できるようにする。
 */
let items: MannerItemDetail[] = INITIAL_ITEMS.map(clone);

function clone(item: MannerItemDetail): MannerItemDetail {
  return {
    ...item,
    relatedSpotIds: [...item.relatedSpotIds],
    localizations: Object.fromEntries(
      LANG_KEYS.map((lang) => [lang, { ...item.localizations[lang] }]),
    ) as MannerItemDetail["localizations"],
  };
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
}

/** マナー項目の一覧を取得する（mock）。 */
export async function fetchMannerItems(): Promise<MannerItemDetail[]> {
  await delay();
  return items.map(clone);
}

/**
 * マナー項目を追加する（mock）。
 *
 * `id` は英語タイトルの slug から作る。ジャンル（Backend #153）で「ID の命名は運営の
 * 関心事ではない」と決まったため、同じ扱いにそろえた。**管理 API 実装時に要確認**。
 * 衝突した場合はジャンルと同じく連番を付ける。
 */
export async function createMannerItem(
  input: MannerItemInput,
): Promise<MannerItemDetail> {
  await delay();
  const base = toMannerId(input.localizations.en.title);
  if (base === "") {
    throw new Error(
      "English のタイトルから ID を作れませんでした。半角英数字を含めてください。",
    );
  }
  const created = clone({ ...input, id: uniqueId(base) });
  items = [...items, created];
  return clone(created);
}

/**
 * マナー項目を更新する（mock）。
 *
 * `id` は変えない。Client が項目詳細（`/manner/[id]`）の遷移先に使っており、変えると
 * 既存のリンクが切れる。
 */
export async function updateMannerItem(
  id: string,
  input: MannerItemInput,
): Promise<MannerItemDetail> {
  await delay();
  if (!items.some((item) => item.id === id)) {
    throw new Error("対象のマナー項目が見つかりませんでした。");
  }
  const updated = clone({ ...input, id });
  items = items.map((item) => (item.id === id ? updated : item));
  return clone(updated);
}

/** マナー項目を削除する（mock）。 */
export async function deleteMannerItem(id: string): Promise<void> {
  await delay();
  if (!items.some((item) => item.id === id)) {
    throw new Error("対象のマナー項目が見つかりませんでした。");
  }
  items = items.filter((item) => item.id !== id);
}

/** 全対応言語ぶんの空欄。フォームの初期値に使う。 */
export function emptyLocalizations(): MannerItemDetail["localizations"] {
  return Object.fromEntries(
    LANG_KEYS.map((lang) => [lang, { title: "", description: "" }]),
  ) as MannerItemDetail["localizations"];
}

/**
 * 英語タイトルから ID の slug を作る（`No littering` → `no-littering`）。
 *
 * ジャンルの `GenreCode.fromLabel` と同じ規則。作れない場合は空文字を返す。
 */
export function toMannerId(englishTitle: string): string {
  return englishTitle
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** 既存と衝突しない ID を決める。`no-littering` が埋まっていれば `no-littering-2`。 */
function uniqueId(base: string): string {
  if (!items.some((item) => item.id === base)) return base;
  for (let suffix = 2; suffix < 100; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!items.some((item) => item.id === candidate)) return candidate;
  }
  throw new Error("ID を採番できませんでした。English のタイトルを変えてください。");
}
