export type Uma = {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  type?: string;
  region: string;
  danger?: 1 | 2 | 3 | 4 | 5;
  existence_rank: "S" | "A" | "B" | "C" | "D";
  evidence_rank: "A" | "B" | "C" | "D" | "E";
  views: number;
  body?: string;
  source?: { title: string; url?: string }[];
  caution?: string[];
  updatedAt: string;
  createdAt?: string;
};

export const umas: Uma[] = [
  {
    title: "霧羽の巨鳥",
    slug: "kiriba-bird",
    summary: "山間に現れる巨大な黒い鳥影。翼音だけが残る。",
    tags: ["山", "鳥類型", "飛行型", "巨大生物", "複数証言"],
    type: "鳥型",
    region: "日本",
    danger: 2,
    existence_rank: "D",
    evidence_rank: "D",
    views: 0,
    body: "深い霧の日に山の稜線を横切る巨大な影が目撃される。鳴き声より風圧だけが残るという。",
    source: [{ title: "山岳観測メモ" }],
    updatedAt: "2026-01-22",
    createdAt: "2026-01-22",
  },
  {
    title: "湖底の長首",
    slug: "lake-long-neck",
    summary: "霧の湖に首の長い影が浮かぶという報告。",
    tags: ["湖", "哺乳類型", "巨大生物", "複数証言"],
    type: "水棲",
    region: "日本",
    danger: 1,
    existence_rank: "D",
    evidence_rank: "E",
    views: 0,
    body: "霧が出る朝に湖面へ首の長い影が浮かぶという複数の証言。",
    caution: ["私有地側の桟橋に近づかない"],
    source: [
      { title: "写真投稿コミュニティ" },
      { title: "地方紙の小記事" },
    ],
    updatedAt: "2026-01-12",
    createdAt: "2026-01-12",
  },
  {
    title: "木陰の猿人",
    slug: "forest-ape",
    summary: "深い森で人に似た影が追跡するという目撃談。",
    tags: ["森林", "山", "人型", "哺乳類型", "複数証言"],
    type: "猿人",
    region: "日本",
    danger: 3,
    existence_rank: "C",
    evidence_rank: "C",
    views: 0,
    updatedAt: "2026-01-16",
    createdAt: "2026-01-16",
  },
  {
    title: "白砂の甲羅",
    slug: "white-shell",
    summary: "海岸に巨大な甲羅の痕跡が残るという報告。",
    tags: ["海", "爬虫類型", "巨大生物", "複数証言"],
    type: "水棲",
    region: "日本",
    danger: 2,
    existence_rank: "D",
    evidence_rank: "D",
    views: 0,
    updatedAt: "2026-01-09",
    createdAt: "2026-01-09",
  },
];