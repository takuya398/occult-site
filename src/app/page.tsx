import Hero from "@/components/Hero";
import NoticeBoard from "@/components/NoticeBoard";
import RankingList from "@/components/RankingList";
import FeatureList from "@/components/FeatureList";
import ArticleGridWithFilter from "@/components/ArticleGridWithFilter";
import CategoryList from "@/components/CategoryList";
import PopularTags from "@/components/PopularTags";
import { getAllLatest, getLatestGrouped, type LatestItem } from "@/lib/server-loaders";
import { getSpotEntryBySlug } from "@/lib/spot-articles";

const CDN = "https://res.cloudinary.com/dgl4jmgvo/image/upload/f_auto,q_auto";

const HERO_SLUG = "hotel-katsugyo";

function withCoverFallback(item: LatestItem): LatestItem {
  if (item.cover) return item;
  if (item.category === "spots") {
    return { ...item, cover: `${CDN}/spots/${item.slug}/cover.jpg` };
  }
  return item;
}

export default async function Home() {
  const articles = (await getAllLatest(20)).map(withCoverFallback);
  const grouped = await getLatestGrouped(12);

  const rankingArticles = articles.slice(0, 5);
  const featureArticles = articles.slice(0, 3);

  const heroSpot = await getSpotEntryBySlug(HERO_SLUG);
  const heroArticle = heroSpot
    ? {
        title: heroSpot.title,
        href: `/spots/${heroSpot.slug}`,
        cover: heroSpot.coverImage?.src,
        summary: heroSpot.summary,
      }
    : articles[0];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#07000a] dark:text-[#e8ddd0] dark:[background-image:radial-gradient(ellipse_at_50%_0%,rgba(74,14,107,0.18)_0%,transparent_55%)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-14">

        {/* 1. ヒーロー */}
        <Hero article={heroArticle}>
          <NoticeBoard />
        </Hero>

        {/* 2. 人気ランキング */}
        <section>
          <RankingList articles={rankingArticles} />
        </section>

        {/* 3. 特集・まとめ */}
        <section>
          <FeatureList articles={featureArticles} />
        </section>

        {/* 4. 新着記事（ジャンルフィルタ付き） */}
        <section>
          <ArticleGridWithFilter grouped={grouped} />
        </section>

        {/* 5. 都道府県カテゴリ */}
        <section>
          <CategoryList />
        </section>

        {/* 6. 人気タグ */}
        <section>
          <PopularTags />
        </section>

        <footer className="text-xs italic text-zinc-500 dark:text-zinc-600">
          「汝、深淵を覗く者よ──くれぐれも安全第一で。」
        </footer>
      </div>
    </div>
  );
}
