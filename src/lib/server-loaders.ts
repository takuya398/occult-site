/**
 * Server-only loaders — uses Node.js fs/path via spot-articles.
 * Do NOT import this from client components.
 */
import { getSpotEntriesFromArticles } from "@/lib/spot-articles";
import { loadStories, loadUmas } from "@/loaders";
import type { Category } from "@/types";

export type LatestItem = {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  status: string;
  publishedAt: string;
  updatedAt?: string;
  category: Category;
  href: string;
};

// Category sort priority: UMA and stories before mtime-based spots on same date
const CATEGORY_ORDER: Record<Category, number> = { uma: 0, stories: 1, spots: 2 };

export const getAllLatest = async (limit = 6): Promise<LatestItem[]> => {
  const spots = await getSpotEntriesFromArticles();
  const storyList = loadStories();
  const umaList = loadUmas();

  const all: LatestItem[] = [
    ...spots.map((x) => ({ ...x, href: `/spots/${x.slug}` })),
    ...storyList.map((x) => ({ ...x, href: `/stories/${x.slug}` })),
    ...umaList.map((x) => ({ ...x, href: `/uma/${x.slug}` })),
  ];

  return all
    .sort((a, b) => {
      const dateA = a.publishedAt || a.updatedAt || "1970-01-01";
      const dateB = b.publishedAt || b.updatedAt || "1970-01-01";
      const diff = Date.parse(dateB) - Date.parse(dateA);
      if (diff !== 0) return diff;
      // Same date: curated categories (UMA, stories) before mtime-based spots
      const catDiff = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
      if (catDiff !== 0) return catDiff;
      return a.slug.localeCompare(b.slug);
    })
    .slice(0, limit);
};
