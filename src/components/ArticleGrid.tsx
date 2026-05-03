import Link from "next/link";
import ArticleImage from "@/components/ArticleImage";

type ArticleCard = {
  title: string;
  href: string;
  cover?: string;
  category: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  spots: "心霊スポット",
  legends: "怪談・都市伝説",
  stories: "怪談・都市伝説",
  uma: "UMA",
  entities: "UMA・異形",
  mysteries: "怪事件",
};

type Props = {
  articles: ArticleCard[];
};

export default function ArticleGrid({ articles }: Props) {
  if (!articles.length) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
          新着記事
        </h2>
        <div className="flex gap-3 text-xs text-zinc-500">
          <Link href="/spots" className="hover:text-red-400 transition-colors">
            心霊 →
          </Link>
          <Link href="/legends" className="hover:text-red-400 transition-colors">
            怪談 →
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {articles.map((item) => (
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
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl opacity-20 select-none">
                  👻
                </div>
              )}
            </div>
            <div className="p-3 flex flex-col gap-1">
              <span className="text-[10px] font-medium text-zinc-400">
                {CATEGORY_LABEL[item.category] ?? item.category}
              </span>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                {item.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
