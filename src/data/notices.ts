export type Notice = {
  date: string;
  text: string;
  url?: string;
};

const notices: Notice[] = [
  { date: "2026/06/02", text: "心霊体験談の投稿受付中！あなたの不思議な体験をぜひ投稿してください。", url: "/experiences/new" },
  { date: "2026/06/02", text: "心霊体験談投稿機能をリリースしました" },
  { date: "2026/05/21", text: "新記事を追加しました" },
];

export default notices;
