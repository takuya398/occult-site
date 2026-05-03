import Link from "next/link";
import ArticleImage from "@/components/ArticleImage";

type HeroArticle = {
  title: string;
  href: string;
  cover?: string;
  summary?: string;
};

type Props = {
  article?: HeroArticle;
};

export default function Hero({ article }: Props) {
  return (
    <div className="space-y-8">
      {/* サイトブランディング */}
      <header className="space-y-5">
        <p className="gothic-eyebrow text-xs font-semibold uppercase">
          Occult Encyclopedia
        </p>
        <h1 className="gothic-title text-4xl font-bold tracking-tight text-zinc-900 dark:text-[#e8ddd0] sm:text-5xl">
          オカルト図鑑
        </h1>
        <div className="gothic-divider">✦</div>
        <p className="text-base italic text-zinc-500 dark:text-zinc-500 sm:text-lg">
          「深淵の向こうに──何がある」
        </p>
      </header>

      {/* 特集カード */}
      <div className="relative w-full overflow-hidden rounded-2xl h-[360px] sm:h-[420px]">
        {article?.cover ? (
          <ArticleImage
            src={article.cover}
            alt=""
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover object-center"
            priority
            fallbackClassName="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <p className="gothic-eyebrow text-xs mb-3">特集</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 line-clamp-2 drop-shadow-lg">
            {article?.title ?? "日本各地の心霊スポット・怪談・UMAを探索する"}
          </h2>
          {article?.summary && (
            <p className="hidden sm:block text-sm text-zinc-300 line-clamp-2 mb-4 max-w-xl">
              {article.summary}
            </p>
          )}
          {article && (
            <Link
              href={article.href}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-900 border border-red-700/40 px-5 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors w-fit"
            >
              記事を読む →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
