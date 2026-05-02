import Image from "next/image";
import Link from "next/link";

type ArticleCard = {
  title: string;
  href: string;
  cover?: string;
  summary?: string;
};

const RANK_BADGE = [
  "bg-yellow-400 text-yellow-950",
  "bg-zinc-300 text-zinc-800 dark:bg-zinc-600 dark:text-zinc-100",
  "bg-orange-400 text-orange-950",
  "bg-zinc-700 text-zinc-200",
  "bg-zinc-700 text-zinc-200",
];

type Props = {
  articles: ArticleCard[];
};

export default function RankingList({ articles }: Props) {
  if (!articles.length) return null;
  const [first, ...rest] = articles;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-3">
        人気ランキング
        <span className="text-xs text-zinc-500 font-normal">※暫定</span>
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 1位 — 大きく */}
        <Link
          href={first.href}
          className="group relative flex flex-col overflow-hidden rounded-xl border-2 border-yellow-400/60 bg-white dark:bg-zinc-900 hover:-translate-y-0.5 transition-transform"
        >
          <span className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-yellow-950 text-sm font-black shadow">
            1
          </span>
          <div className="relative aspect-video w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
            {first.cover ? (
              <Image
                src={first.cover}
                alt={first.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl opacity-20 select-none">
                👻
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">
              {first.title}
            </h3>
            {first.summary && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {first.summary}
              </p>
            )}
          </div>
        </Link>

        {/* 2〜5位 */}
        <div className="grid grid-cols-2 gap-3">
          {rest.slice(0, 4).map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 hover:-translate-y-0.5 transition-transform"
            >
              <span
                className={`absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-black shadow ${RANK_BADGE[i + 1]}`}
              >
                {i + 2}
              </span>
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                {item.cover ? (
                  <Image
                    src={item.cover}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl opacity-20 select-none">
                    👻
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
