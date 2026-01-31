export type Uma = {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  type?: string;
  credibility?: "S" | "A" | "B" | "C" | "D";
  danger?: 1 | 2 | 3 | 4 | 5;
};

export const umas: Uma[] = [
  {
    title: "霧羽の巨鳥",
    slug: "kiriba-bird",
    summary: "山間に現れる巨大な黒い鳥影。翼音だけが残る。",
    tags: ["飛行", "目撃"],
    type: "鳥型",
    credibility: "C",
    danger: 2,
  },
  {
    title: "湖底の長首",
    slug: "lake-long-neck",
    summary: "霧の湖に首の長い影が浮かぶという報告。",
    tags: ["水棲", "湖"],
    type: "水棲",
    credibility: "D",
    danger: 1,
  },
  {
    title: "木陰の猿人",
    slug: "forest-ape",
    summary: "深い森で人に似た影が追跡するという目撃談。",
    tags: ["猿人", "山"],
    type: "猿人",
    credibility: "B",
    danger: 3,
  },
  {
    title: "白砂の甲羅",
    slug: "white-shell",
    summary: "海岸に巨大な甲羅の痕跡が残るという報告。",
    tags: ["海", "痕跡"],
    type: "水棲",
    credibility: "C",
    danger: 2,
  },
];
