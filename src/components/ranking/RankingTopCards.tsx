import Image from "next/image";
import Link from "next/link";
import type { RankingItem } from "@/lib/ranking/getRankingItems";

const RANK_STYLES = [
  {
    border: "border-yellow-400 dark:border-yellow-500/60",
    badge: "bg-yellow-400 text-yellow-950",
    label: "text-yellow-500",
  },
  {
    border: "border-zinc-300 dark:border-zinc-600",
    badge: "bg-zinc-300 text-zinc-800 dark:bg-zinc-600 dark:text-zinc-100",
    label: "text-zinc-400",
  },
  {
    border: "border-orange-400 dark:border-orange-600/70",
    badge: "bg-orange-400 text-orange-950",
    label: "text-orange-500",
  },
];

const CATEGORY_LABEL: Record<string, string> = {
  spots: "心霊スポット",
  legends: "都市伝説",
  uma: "UMA",
  entities: "怪異・妖怪",
};

const DANGER_DOTS = (level: number) => "●".repeat(level) + "○".repeat(5 - level);

type Props = {
  items: RankingItem[];
};

export default function RankingTopCards({ items }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.slice(0, 3).map((item, i) => {
        const style = RANK_STYLES[i];
        return (
          <Link
            key={`${item.articleType}:${item.slug}`}
            href={item.href}
            className={`group relative flex flex-col overflow-hidden rounded-xl border-2 ${style.border} bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-zinc-900`}
          >
            {/* Rank badge */}
            <span
              className={`absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-black shadow ${style.badge}`}
            >
              {i + 1}
            </span>

            {/* Cover image */}
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
              {item.cover ? (
                <Image
                  src={item.cover}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl opacity-20 select-none">
                  👻
                </div>
              )}
            </div>

            {/* Card body */}
            <div className="flex flex-1 flex-col gap-2 p-4">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {CATEGORY_LABEL[item.articleType] ?? item.articleType}
                </span>
                {(item.pref || item.region) && (
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    📍 {item.pref ?? item.region}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="line-clamp-2 text-sm font-bold leading-snug text-zinc-900 transition-colors group-hover:text-violet-700 dark:text-zinc-100 dark:group-hover:text-violet-400">
                {item.title}
              </h3>

              {/* Summary */}
              <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {item.summary}
              </p>

              {/* Danger + stats */}
              <div className="mt-auto flex items-center gap-3 pt-1 text-xs text-zinc-400 dark:text-zinc-500">
                {item.danger && (
                  <span className="font-mono" title="危険度">
                    {DANGER_DOTS(item.danger)}
                  </span>
                )}
                <span className="ml-auto">💬 {item.commentCount}</span>
                <span>👍 {item.totalGoodCount}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
