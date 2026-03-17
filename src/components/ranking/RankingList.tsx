import Image from "next/image";
import Link from "next/link";
import type { RankingItem } from "@/lib/ranking/getRankingItems";

const CATEGORY_LABEL: Record<string, string> = {
  spots: "心霊スポット",
  legends: "都市伝説",
  uma: "UMA",
  entities: "怪異・妖怪",
};

type Props = {
  items: RankingItem[];
  startRank?: number;
};

export default function RankingList({ items, startRank = 4 }: Props) {
  return (
    <ol className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
      {items.map((item, i) => {
        const rank = startRank + i;
        return (
          <li key={item.slug}>
            <Link
              href={item.href}
              className="group flex items-center gap-3 rounded-lg px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 sm:gap-4"
            >
              {/* Rank number */}
              <span className="w-6 shrink-0 text-center text-base font-black text-zinc-300 dark:text-zinc-600">
                {rank}
              </span>

              {/* Thumbnail */}
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
                {item.cover ? (
                  <Image
                    src={item.cover}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl opacity-20 select-none">
                    👻
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {CATEGORY_LABEL[item.articleType] ?? item.articleType}
                  </span>
                  {(item.pref || item.region) && (
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      📍 {item.pref ?? item.region}
                    </span>
                  )}
                </div>
                <h3 className="line-clamp-1 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-violet-700 dark:text-zinc-100 dark:group-hover:text-violet-400">
                  {item.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                  <span>💬 {item.commentCount}</span>
                  <span>👍 {item.totalGoodCount}</span>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
