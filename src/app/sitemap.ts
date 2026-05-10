import type { MetadataRoute } from "next";
import { readdirSync, statSync } from "fs";
import path from "path";
import { loadLegends, loadEntities, loadMysteries } from "@/loaders";

const BASE_URL = "https://occultpedia.jp";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, priority: 1.0, changeFrequency: "daily" },
    { url: `${BASE_URL}/spots`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE_URL}/legends`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE_URL}/entities`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE_URL}/mysteries`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE_URL}/ranking`, priority: 0.8, changeFrequency: "daily" },
  ];

  const articlesDir = path.join(process.cwd(), "articles");
  const spotSlugs = readdirSync(articlesDir).filter((name) => {
    try {
      return statSync(path.join(articlesDir, name)).isDirectory();
    } catch {
      return false;
    }
  });
  const spotPages: MetadataRoute.Sitemap = spotSlugs.map((slug) => ({
    url: `${BASE_URL}/spots/${slug}`,
    priority: 0.7,
    changeFrequency: "monthly",
  }));

  const legends = loadLegends();
  const entities = loadEntities();
  const mysteries = loadMysteries();

  const legendPages: MetadataRoute.Sitemap = legends.map((item) => ({
    url: `${BASE_URL}/legends/${item.slug}`,
    priority: 0.7,
    changeFrequency: "monthly",
  }));
  const entityPages: MetadataRoute.Sitemap = entities.map((item) => ({
    url: `${BASE_URL}/entities/${item.slug}`,
    priority: 0.7,
    changeFrequency: "monthly",
  }));
  const mysteryPages: MetadataRoute.Sitemap = mysteries.map((item) => ({
    url: `${BASE_URL}/mysteries/${item.slug}`,
    priority: 0.7,
    changeFrequency: "monthly",
  }));

  return [
    ...staticPages,
    ...spotPages,
    ...legendPages,
    ...entityPages,
    ...mysteryPages,
  ];
}
