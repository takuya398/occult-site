import Link from "next/link";
import ArticleImage from "@/components/ArticleImage";
import styles from "./Hero.module.css";

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
    <div className="space-y-5 sm:space-y-7">

      {/* ── ブランディングヘッダー ── */}
      <header className="relative overflow-hidden rounded-2xl px-8 py-12 sm:px-12 sm:py-16">
        {/* ベースグラデーション：黒 → 濃紺 → 深紫 */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(170deg, #06000e 0%, #0b0320 55%, #0f0626 100%)" }}
        />
        {/* 放射グロー（頂部から紫が降りてくる） */}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(ellipse at 50% -5%, rgba(88,28,135,0.38) 0%, transparent 60%)" }}
        />
        {/* ノイズテクスチャ（極薄） */}
        <div className="uma-noise absolute inset-0 opacity-40" />

        {/* コンテンツ */}
        <div className="relative space-y-6">
          <p className="gothic-eyebrow text-xs font-semibold uppercase">
            Occult Encyclopedia
          </p>
          <h1
            className={`${styles.heroTitle} gothic-title text-4xl font-bold tracking-tight text-[#e8ddd0] sm:text-5xl`}
          >
            オカルト図鑑
          </h1>
          <div className="gothic-divider">✦</div>
          <p className={`${styles.heroSubtitle} text-sm sm:text-base italic text-zinc-300`}>
            「深淵の向こうに──何がある」
          </p>
        </div>
      </header>

      {/* ── 特集カード ── */}
      <div>
        <p className="gothic-eyebrow text-xs mb-3">今夜の怪異</p>
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

    </div>
  );
}
