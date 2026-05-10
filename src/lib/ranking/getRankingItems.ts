/**
 * Server-only: ranking data loader.
 * Combines static article data with Supabase comment stats.
 * Swap the scoring formula here when view_count data becomes available.
 */
import { createAdminClient } from "@/lib/supabase-admin";
import { getSpotEntriesFromArticles } from "@/lib/spot-articles";
import { loadLegends, loadEntities } from "@/loaders";
import type { Category } from "@/types";

export type Period = "weekly" | "monthly" | "yearly";
export type RankingCategory = "all" | "spots" | "legends" | "entities";

export type RankingItem = {
  slug: string;
  articleType: string;
  category: Category;
  title: string;
  summary: string;
  cover?: string;
  href: string;
  pref?: string;
  region?: string;
  danger?: number;
  credibility?: string;
  existenceRank?: string;
  publishedAt: string;
  /** Composite popularity score (replace internals when view_count is available) */
  score: number;
  commentCount: number;
  totalGoodCount: number;
};

const PERIOD_DAYS: Record<Period, number> = {
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

const TYPE_FILTER: Record<RankingCategory, string[]> = {
  all: ["spots", "legends", "entities"],
  spots: ["spots"],
  legends: ["legends"],
  entities: ["entities"],
};

type ArticleMeta = Omit<RankingItem, "score" | "commentCount" | "totalGoodCount">;

async function loadAllArticles(): Promise<ArticleMeta[]> {
  const [spots, legends, entities] = await Promise.all([
    getSpotEntriesFromArticles(),
    Promise.resolve(loadLegends()),
    Promise.resolve(loadEntities()),
  ]);

  return [
    ...spots.map((x): ArticleMeta => ({
      slug: x.slug,
      articleType: "spots",
      category: "spots",
      title: x.title,
      summary: x.summary,
      cover: x.coverImage?.src,
      href: `/spots/${x.slug}`,
      pref: x.pref,
      danger: x.danger,
      credibility: x.credibility,
      publishedAt: x.publishedAt,
    })),
    ...legends.map((x): ArticleMeta => {
      // coverImage is typed as string but some entries store an ImageMedia object
      const rawCover = x.coverImage as unknown;
      const cover =
        typeof rawCover === "string"
          ? rawCover || undefined
          : rawCover && typeof rawCover === "object" && "src" in rawCover
            ? (rawCover as { src: string }).src
            : undefined;
      return {
        slug: x.slug,
        articleType: "legends",
        category: "legends",
        title: x.title,
        summary: x.summary,
        cover,
        href: `/legends/${x.slug}`,
        danger: x.danger,
        credibility: x.credibility,
        publishedAt: x.publishedAt,
      };
    }),
    ...entities.map((x): ArticleMeta => ({
      slug: x.slug,
      articleType: "entities",
      category: "entities",
      title: x.title,
      summary: x.summary,
      cover: x.coverImage?.src,
      href: `/entities/${x.slug}`,
      region: x.region,
      danger: x.danger,
      existenceRank: x.existence_rank,
      publishedAt: x.publishedAt,
    })),
  ];
}

/**
 * Returns top `limit` ranked articles for the given period and category.
 *
 * Scoring formula (temporary — replace when view_count data is available):
 *   score = commentCount * 3 + totalGoodCount * 1
 *
 * Articles with the same score are sorted by publishedAt desc.
 */
export async function getRankingItems(
  period: Period,
  rankCategory: RankingCategory,
  limit = 10
): Promise<RankingItem[]> {
  const allArticles = await loadAllArticles();
  const targetTypes = TYPE_FILTER[rankCategory];
  const filtered = allArticles.filter((a) => targetTypes.includes(a.articleType));

  // Fetch comment stats for the period from Supabase
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - PERIOD_DAYS[period]);

  const supabase = createAdminClient();
  const [{ data: comments }, { data: views }] = await Promise.all([
    supabase
      .from("comments")
      .select("slug, article_type, good_count")
      .eq("is_approved", true)
      .gte("created_at", periodStart.toISOString()),
    supabase
      .from("article_views")
      .select("article_slug, article_type")
      .gte("viewed_at", periodStart.toISOString()),
  ]);

  // Aggregate comments per article
  const statsMap = new Map<string, { commentCount: number; totalGoodCount: number }>();
  for (const row of comments ?? []) {
    const key = `${row.article_type}:${row.slug}`;
    const prev = statsMap.get(key) ?? { commentCount: 0, totalGoodCount: 0 };
    statsMap.set(key, {
      commentCount: prev.commentCount + 1,
      totalGoodCount: prev.totalGoodCount + (row.good_count ?? 0),
    });
  }

  // Aggregate view counts per article
  const viewMap = new Map<string, number>();
  for (const row of views ?? []) {
    const key = `${row.article_type}:${row.article_slug}`;
    viewMap.set(key, (viewMap.get(key) ?? 0) + 1);
  }

  // Score, sort, slice
  return filtered
    .map((article) => {
      const key = `${article.articleType}:${article.slug}`;
      const stats = statsMap.get(key) ?? { commentCount: 0, totalGoodCount: 0 };
      const viewCount = viewMap.get(key) ?? 0;
      const score = viewCount + stats.commentCount * 3 + stats.totalGoodCount;
      return { ...article, score, ...stats };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
    })
    .slice(0, limit);
}
