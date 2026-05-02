import Link from "next/link";

const PREFECTURES = [
  "北海道",
  "青森", "岩手", "宮城", "秋田", "山形", "福島",
  "茨城", "栃木", "群馬", "埼玉", "千葉", "東京", "神奈川",
  "新潟", "富山", "石川", "福井", "山梨", "長野",
  "岐阜", "静岡", "愛知", "三重",
  "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山",
  "鳥取", "島根", "岡山", "広島", "山口",
  "徳島", "香川", "愛媛", "高知",
  "福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄",
];

const SPECIAL: Record<string, string> = {
  北海道: "北海道",
  東京: "東京都",
  京都: "京都府",
  大阪: "大阪府",
};

const toPrefFull = (name: string) => SPECIAL[name] ?? `${name}県`;

export default function CategoryList() {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
        都道府県で探す
      </h2>
      <div className="flex flex-wrap gap-2">
        {PREFECTURES.map((pref) => (
          <Link
            key={pref}
            href={`/spots?pref=${encodeURIComponent(toPrefFull(pref))}`}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:border-red-700/50 hover:bg-red-50 hover:text-red-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-red-700/50 dark:hover:bg-red-950/30 dark:hover:text-red-300"
          >
            {pref}
          </Link>
        ))}
      </div>
    </div>
  );
}
