export type Spot = {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  pref?: string;
  type?: string;
  credibility?: "S" | "A" | "B" | "C" | "D";
  danger?: 1 | 2 | 3 | 4 | 5;
  body?: string;
  source?: { title: string; url?: string }[];
  caution?: string[];
  updatedAt: string;
};

export const spots: Spot[] = [
  {
    title: "夜霧峠トンネル",
    slug: "yogiri-toge-tunnel",
    summary: "深夜に車のエンジンが止まると噂される旧道トンネル。",
    tags: ["トンネル", "旧道", "心霊"],
    pref: "群馬県",
    type: "トンネル",
    credibility: "B",
    danger: 3,
    body: "山間部の旧道に残る短いトンネル。霧が濃い夜に音が反響し、背後から足音が近づくと語られる。",
    caution: ["夜間の停車は避ける", "落石に注意"],
    source: [
      {
        title: "地元掲示板の体験談まとめ",
        url: "https://example.com/yogiri-report",
      },
    ],
    updatedAt: "2026-01-31",
  },
  {
    title: "白砂浜の廃旅館",
    slug: "shirasuna-ruins",
    summary: "海霧の夜に窓辺に影が立つと語られる廃旅館。",
    tags: ["廃墟", "海辺", "目撃"],
    pref: "静岡県",
    type: "廃墟",
    credibility: "C",
    danger: 4,
    body: "海辺に取り残された建物で、潮風の音に混じって人の声が聞こえるという。",
    caution: ["立入禁止区域に入らない"],
    source: [{ title: "個人ブログの記録" }],
    updatedAt: "2026-01-29",
  },
  {
    title: "黒鏡ダム",
    slug: "kurokagami-dam",
    summary: "水面に逆さの人影が映るというダム湖。",
    tags: ["ダム", "水面", "怪異"],
    pref: "福島県",
    type: "ダム",
    credibility: "B",
    danger: 2,
    updatedAt: "2026-01-20",
  },
  {
    title: "旧赤坂病院跡",
    slug: "akasaka-hospital",
    summary: "閉鎖後もナースコールが鳴ると噂される建物跡。",
    tags: ["病院", "廃墟", "都市伝説"],
    pref: "大阪府",
    type: "廃墟",
    credibility: "A",
    danger: 4,
    updatedAt: "2026-01-27",
  },
  {
    title: "三日月谷の吊り橋",
    slug: "mikazuki-bridge",
    summary: "深夜に橋を渡ると足音が追ってくるという。",
    tags: ["橋", "山道", "体験談"],
    pref: "長野県",
    type: "橋",
    credibility: "C",
    danger: 3,
    updatedAt: "2026-01-24",
  },
  {
    title: "蒼灯台の岬",
    slug: "ao-todai-cape",
    summary: "青い光が海面を這うと語られる岬の灯台。",
    tags: ["灯台", "海", "怪光"],
    pref: "北海道",
    type: "岬",
    credibility: "D",
    danger: 2,
    updatedAt: "2026-01-15",
  },
];
