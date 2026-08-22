import Hero from "@/components/Hero";
import NoticeBoard from "@/components/NoticeBoard";
import RankingList from "@/components/RankingList";
import FeatureList from "@/components/FeatureList";
import ArticleGridWithFilter from "@/components/ArticleGridWithFilter";
import CategoryList from "@/components/CategoryList";
import PopularTags from "@/components/PopularTags";
import SidebarRankingWidget from "@/components/SidebarRankingWidget";
import { getAllLatest, getLatestGrouped, type LatestItem } from "@/lib/server-loaders";
import { getSpotEntryBySlug } from "@/lib/spot-articles";
import { getRankingItems } from "@/lib/ranking/getRankingItems";

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

  const [weeklyRanking, monthlyRanking, yearlyRanking] = await Promise.all([
    getRankingItems("weekly", "all", 10).catch(() => []),
    getRankingItems("monthly", "all", 10).catch(() => []),
    getRankingItems("yearly", "all", 10).catch(() => []),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#07000a] dark:text-[#e8ddd0] dark:[background-image:radial-gradient(ellipse_at_50%_0%,rgba(74,14,107,0.18)_0%,transparent_55%)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-start gap-10 lg:flex-row">

          {/* メインコンテンツ */}
          <div className="flex min-w-0 flex-1 flex-col gap-12">
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

          {/* サイドバー：PC右固定、スマホはメイン下部 */}
          <aside className="w-full lg:sticky lg:top-[76px] lg:w-72 xl:w-80">
            <SidebarRankingWidget
              weekly={weeklyRanking}
              monthly={monthlyRanking}
              yearly={yearlyRanking}
            />
          </aside>

        </div>
      </div>
    </div>
  );
}
