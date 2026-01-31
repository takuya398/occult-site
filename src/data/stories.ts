export type Story = {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  type?: string;
  credibility?: "S" | "A" | "B" | "C" | "D";
  danger?: 1 | 2 | 3 | 4 | 5;
};

export const stories: Story[] = [
  {
    title: "返事のない校内放送",
    slug: "school-broadcast",
    summary: "深夜の校内放送に答えると二度と声が戻らないという。",
    tags: ["学校", "怪談", "体験談"],
    type: "怪談",
    credibility: "B",
    danger: 2,
  },
  {
    title: "赤い傘の合図",
    slug: "red-umbrella",
    summary: "交差点で赤い傘を持つ人に会うと不運が続く都市伝説。",
    tags: ["都市伝説", "遭遇"],
    type: "都市伝説",
    credibility: "C",
    danger: 1,
  },
  {
    title: "階段の数を数えるな",
    slug: "counting-stairs",
    summary: "夜の集合住宅で階段を数えると一段多くなる。",
    tags: ["集合住宅", "意味怖"],
    type: "意味怖",
    credibility: "C",
    danger: 2,
  },
  {
    title: "最後の車両",
    slug: "last-car",
    summary: "終電の最後尾に座ると誰かが隣に座るという。",
    tags: ["電車", "怪談"],
    type: "怪談",
    credibility: "B",
    danger: 2,
  },
  {
    title: "消える路地裏",
    slug: "vanishing-alley",
    summary: "地図にない路地に入ると翌日には入口が消えている。",
    tags: ["都市伝説", "異界"],
    type: "都市伝説",
    credibility: "D",
    danger: 3,
  },
  {
    title: "笑う鏡",
    slug: "laughing-mirror",
    summary: "鏡の中の自分が先に笑ったら振り返るなと言われる。",
    tags: ["鏡", "怪談"],
    type: "怪談",
    credibility: "B",
    danger: 2,
  },
];
