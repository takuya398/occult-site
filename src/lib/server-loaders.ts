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
    ...legendList.map((x) => ({ ...x, href: `/legends/${x.slug}`, cover: typeof x.coverImage === "string" ? x.coverImage : x.coverImage?.src })),
    ...entityList.map((x) => ({ ...x, href: `/entities/${x.slug}`, cover: x.coverImage?.src })),
    ...mysteryList.map((x) => ({ ...x, href: `/mysteries/${x.slug}`, cover: x.coverImage?.src })),
  ];

  return all;
});

export const getAllLatest = async (limit = 6): Promise<LatestItem[]> => {
  const all = await loadAllItems();
  return [...all].sort(sortByDate).slice(0, limit);
};

export type HeroArticle = {
  title: string;
  href: string;
  cover?: string;
  summary?: string;
};

export const getDailyHeroArticle = async (): Promise<HeroArticle> => {
  const all = await loadAllItems();
  const pool = all.filter((x) => x.category === "spots" || x.category === "mysteries");

  if (pool.length === 0) return pool[0] as never;

  const epochDays = Math.floor(Date.now() / 86_400_000);
  const item = pool[epochDays % pool.length];

  const cover =
    item.cover ??
    (item.category === "spots" ? `${CDN}/spots/${item.slug}/cover.jpg` : undefined);

  return { title: item.title, href: item.href, cover, summary: item.summary };
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

  // "すべて"タブは各カテゴリから均等に枠を確保してから日付順に並べる
  // （spots記事が日付上位を独占するとミステリー等が全く出なくなるため）
  const perCat = Math.ceil(limitEach / 4);
  const allMixed = [
    ...sorted.filter((x) => x.category === "spots").slice(0, perCat),
    ...sorted.filter((x) => x.category === "stories" || x.category === "legends").slice(0, perCat),
    ...sorted.filter((x) => x.category === "entities").slice(0, perCat),
    ...sorted.filter((x) => x.category === "mysteries").slice(0, perCat),
  ].sort(sortByDate).slice(0, limitEach);

  return {
    all: allMixed.map(toCard),
    spots: sorted.filter((x) => x.category === "spots").slice(0, limitEach).map(toCard),
    stories: sorted.filter((x) => x.category === "stories" || x.category === "legends").slice(0, limitEach).map(toCard),
    entities: sorted.filter((x) => x.category === "entities").slice(0, limitEach).map(toCard),
    mysteries: sorted.filter((x) => x.category === "mysteries").slice(0, limitEach).map(toCard),
  };
};
