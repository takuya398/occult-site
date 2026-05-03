import Link from "next/link";
import ArticleImage from "@/components/ArticleImage";

type ArticleCard = {
  title: string;
  href: string;
  cover?: string;
  summary?: string;
};

type Props = {
  articles: ArticleCard[];
};

export default function FeatureList({ articles }: Props) {
  if (!articles.length) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
          特集・まとめ
        </h2>
        <Link
          href="/spots"
          className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
        >
          もっと見る →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {articles.slice(0, 3).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 hover:-translate-y-0.5 transition-transform"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
              {item.cover ? (
                <ArticleImage
                  src={item.cover}
                  alt={item.title}
                  sizes="(max-width: 640px) 100vw, 33vw"
                  fallbackClassName="flex h-full w-full items-center justify-center text-4xl opacity-20 select-none"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl opacity-20 select-none">
                  👻
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4 gap-2">
              <span className="gothic-eyebrow text-[10px] tracking-widest text-red-400">
                特集
              </span>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                {item.title}
              </h3>
              {item.summary && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3">
                  {item.summary}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
