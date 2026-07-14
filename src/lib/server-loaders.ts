/**
 * Server-only loaders — uses Node.js fs/path via spot-articles.
 * Do NOT import this from client components.
 */
import { cache } from "react";
import { getSpotEntriesFromArticles } from "@/lib/spot-articles";
import { loadLegends, loadEntities, loadMysteries } from "@/loaders";
import type { Category } from "@/types";

export type LatestItem = {
  title: string;
  ruby?: string;
  slug: string;
  summary: string;
  tags: string[];
  status: string;
  publishedAt: string;
  updatedAt?: string;
  category: Category;
  href: string;
  cover?: string;
};

export type ArticleCard = {
  title: string;
  slug: string;
  href: string;
  cover?: string;
  category: string;
};

export type GroupedArticles = {
  all: ArticleCard[];
  spots: ArticleCard[];
  stories: ArticleCard[];
  entities: ArticleCard[];
  mysteries: ArticleCard[];
};

const CDN = "https://res.cloudinary.com/dgl4jmgvo/image/upload/f_auto,q_auto";

// Category sort priority: legends/UMA before mtime-based spots on same date
const CATEGORY_ORDER: Record<Category, number> = { uma: 0, entities: 0, legends: 1, stories: 1, spots: 2, mysteries: 3 };

const sortByDate = (a: LatestItem, b: LatestItem): number => {
  const dateA = [a.publishedAt, a.updatedAt].filter(Boolean).sort().pop() || "1970-01-01";
  const dateB = [b.publishedAt, b.updatedAt].filter(Boolean).sort().pop() || "1970-01-01";
  const diff = Date.parse(dateB) - Date.parse(dateA);
  if (diff !== 0) return diff;
  const catDiff = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
  if (catDiff !== 0) return catDiff;
  return a.slug.localeCompare(b.slug);
};

const loadAllItems = cache(async (): Promise<LatestItem[]> => {
  const spots = await getSpotEntriesFromArticles();
  const legendList = loadLegends();
  const entityList = loadEntities();
  const mysteryList = loadMysteries();

  const all: LatestItem[] = [
    ...spots.map((x) => ({ ...x, href: `/spots/${x.slug}`, cover: x.coverImage?.src })),
    ...legendList.map((x) => ({ ...x, href: `/legends/${x.slug}`, cover: x.coverImage })),
    ...entityList.map((x) => ({ ...x, href: `/entities/${x.slug}`, cover: x.coverImage?.src })),
    ...mysteryList.map((x) => ({ ...x, href: `/mysteries/${x.slug}`, cover: x.coverImage?.src })),
  ];

  return all;
});

export const getAllLatest = async (limit = 6): Promise<LatestItem[]> => {
  const all = await loadAllItems();
  return [...all].sort(sortByDate).slice(0, limit);
};

export const getLatestGrouped = async (limitEach = 12): Promise<GroupedArticles> => {
  const all = await loadAllItems();
  const sorted = [...all].sort(sortByDate);

  const toCard = (x: LatestItem): ArticleCard => ({
    title: x.title,
    slug: x.slug,
    href: x.href,
    cover: x.cover ?? (x.category === "spots" ? `${CDN}/spots/${x.slug}/cover.jpg` : undefined),
    category: x.category,
  });

  return {
    all: sorted.slice(0, limitEach).map(toCard),
    spots: sorted.filter((x) => x.category === "spots").slice(0, limitEach).map(toCard),
    stories: sorted.filter((x) => x.category === "stories" || x.category === "legends").slice(0, limitEach).map(toCard),
    entities: sorted.filter((x) => x.category === "entities").slice(0, limitEach).map(toCard),
    mysteries: sorted.filter((x) => x.category === "mysteries").slice(0, limitEach).map(toCard),
  };
};
