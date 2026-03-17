import type { Metadata } from "next";
import { getRankingItems, type Period, type RankingCategory } from "@/lib/ranking/getRankingItems";
import RankingTabs from "@/components/ranking/RankingTabs";
import RankingCategoryTabs from "@/components/ranking/RankingCategoryTabs";
import RankingTopCards from "@/components/ranking/RankingTopCards";
import RankingList from "@/components/ranking/RankingList";
import Breadcrumbs from "@/components/Breadcrumbs";

const VALID_PERIODS: Period[] = ["weekly", "monthly", "yearly"];
const VALID_CATEGORIES: RankingCategory[] = ["all", "spots", "legends", "uma", "entities"];

const PERIOD_LABEL: Record<Period, string> = {
  weekly: "週間",
  monthly: "月間",
  yearly: "年間",
};

const CATEGORY_LABEL: Record<RankingCategory, string> = {
  all: "総合",
  spots: "心霊スポット",
  legends: "都市伝説",
  uma: "UMA",
  entities: "怪異・妖怪",
};

function parsePeriod(raw: string | undefined): Period {
  return VALID_PERIODS.includes(raw as Period) ? (raw as Period) : "weekly";
}

function parseCategory(raw: string | undefined): RankingCategory {
  return VALID_CATEGORIES.includes(raw as RankingCategory)
    ? (raw as RankingCategory)
    : "all";
}

type Props = {
  searchParams: Promise<{ period?: string; category?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { period: rawPeriod, category: rawCategory } = await searchParams;
  const period = parsePeriod(rawPeriod);
  const category = parseCategory(rawCategory);

  const pLabel = PERIOD_LABEL[period];
  const cLabel = CATEGORY_LABEL[category];
  const title =
    category === "all"
      ? `${pLabel}人気ランキング | オカルト図鑑`
      : `${pLabel}人気${cLabel}ランキング | オカルト図鑑`;
  const description = `${pLabel}よく読まれている${cLabel === "総合" ? "" : cLabel + "の"}心霊スポット・都市伝説・UMAをランキング形式でご紹介。`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function RankingPage({ searchParams }: Props) {
  const { period: rawPeriod, category: rawCategory } = await searchParams;
  const period = parsePeriod(rawPeriod);
  const category = parseCategory(rawCategory);

  const items = await getRankingItems(period, category, 10);
  const top3 = items.slice(0, 3);
  const rest = items.slice(3);

  const pLabel = PERIOD_LABEL[period];
  const cLabel = CATEGORY_LABEL[category];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "人気ランキング" },
          ]}
        />

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            人気ランキング
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {pLabel}よく読まれている{cLabel === "総合" ? "" : cLabel + "の"}
            コンテンツをランキング形式でご紹介
          </p>
        </div>

        {/* Period tabs */}
        <div className="mb-4">
          <RankingTabs period={period} category={category} />
        </div>

        {/* Category tabs */}
        <div className="mb-8">
          <RankingCategoryTabs period={period} category={category} />
        </div>

        {/* Ranking content */}
        {items.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white px-8 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-400 dark:text-zinc-500">
              この期間のランキングデータがまだありません
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
              コメントや👍が集まると順位が決まります
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* TOP 3 */}
            {top3.length > 0 && (
              <section>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Top 3
                </p>
                <RankingTopCards items={top3} />
              </section>
            )}

            {/* 4位〜 */}
            {rest.length > 0 && (
              <section>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  4位〜{items.length}位
                </p>
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                  <RankingList items={rest} startRank={4} />
                </div>
              </section>
            )}
          </div>
        )}

        {/* Note */}
        <p className="mt-12 text-center text-xs text-zinc-300 dark:text-zinc-700">
          ランキングはコメント数・いいね数をもとに集計しています
        </p>
      </div>
    </div>
  );
}
