import { promises as fs } from "fs";
import path from "path";
import type { SpotEntry } from "@/types";

type Frontmatter = Record<string, unknown>;

type ParsedArticle = {
  frontmatter: Frontmatter;
  body: string;
};

const ARTICLES_DIR = path.join(process.cwd(), "articles");

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const SUMMARY_MAX_LENGTH = 140;

const parseValue = (value: string): unknown => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }
  if (/^-?\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  return trimmed;
};

const parseFrontmatter = (raw: string): ParsedArticle => {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
  if (!match) {
    return { frontmatter: {}, body: raw };
  }

  const frontmatter: Frontmatter = {};
  const lines = match[1].split(/\r?\n/);
  lines.forEach((line) => {
    if (!line.trim()) return;
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) return;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    if (!key) return;
    frontmatter[key] = parseValue(value);
  });

  return { frontmatter, body: raw.slice(match[0].length) };
};

const normalizeString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const normalizeTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((tag): tag is string => typeof tag === "string");
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeDate = (value: unknown): string | undefined => {
  if (value instanceof Date) return formatDate(value);
  if (typeof value === "string" && value.trim()) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return formatDate(new Date(parsed));
    }
  }
  return undefined;
};

const extractTitleFromContent = (content: string) => {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
};

const stripMarkdown = (text: string) =>
  text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}[-*+]\s+/gm, "")
    .replace(/^\s{0,3}\d+\.\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\r?\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
};

const buildSummary = (summaryRaw: string, content: string, title: string) => {
  const firstParagraph = content
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .find(Boolean);
  const source = summaryRaw || firstParagraph || title;
  const plain = stripMarkdown(source) || title;
  return truncateText(plain, SUMMARY_MAX_LENGTH);
};

const stripLeadingTitle = (content: string, title: string) => {
  const normalized = content.trimStart();
  if (!title) return content.trim();
  const titleLine = `# ${title}`;
  if (normalized.startsWith(titleLine)) {
    return normalized.replace(/^#\s+.*\r?\n+/, "").trimStart();
  }
  return content.trim();
};

const ensureVideoToken = (content: string, videoUrl?: string) => {
  if (!videoUrl) return content;
  if (content.includes("{{VIDEO}}")) return content;
  return `${content}\n\n{{VIDEO}}\n`;
};

const linkifySourcesPath = (content: string) =>
  content.replace(/\/articles\/[a-z0-9-]+\/sources\.md/g, (match, offset, full) => {
    const prevChar = full[offset - 1];
    const prevTwo = full.slice(Math.max(0, offset - 2), offset);
    if (prevChar === "[" || prevTwo === "](") {
      return match;
    }
    return `[${match}](${match})`;
  });

const isSpotCategory = (value: string) =>
  value === "" || value === "心霊スポット" || value === "心霊・噂" || value === "spots";

const buildSpotEntry = async (slug: string): Promise<SpotEntry | null> => {
  const articlePath = path.join(ARTICLES_DIR, slug, "index.md");
  let raw = "";
  let stats: { mtime: Date } | null = null;

  try {
    raw = await fs.readFile(articlePath, "utf8");
    stats = await fs.stat(articlePath);
  } catch {
    return null;
  }

  const { frontmatter, body } = parseFrontmatter(raw);
  const titleFromFrontmatter = normalizeString(frontmatter.title);
  const contentTitle = extractTitleFromContent(body);
  const title = titleFromFrontmatter || contentTitle || slug;
  const summaryRaw = normalizeString(frontmatter.summary);
  const contentWithoutTitle = stripLeadingTitle(body, title);
  const summary = buildSummary(summaryRaw, contentWithoutTitle, title);

  const categoryValue = normalizeString(frontmatter.category);
  if (!isSpotCategory(categoryValue)) {
    return null;
  }

  const pref = normalizeString(frontmatter.prefecture) || normalizeString(frontmatter.pref);
  const type = normalizeString(frontmatter.category) || "心霊スポット";
  const credibilityRaw = normalizeString(frontmatter.credibility);
  const credibility = ["S", "A", "B", "C", "D"].includes(credibilityRaw)
    ? (credibilityRaw as SpotEntry["credibility"])
    : undefined;
  const dangerValue = frontmatter.danger;
  const danger =
    typeof dangerValue === "number" && dangerValue >= 1 && dangerValue <= 5
      ? (dangerValue as SpotEntry["danger"])
      : undefined;
  const cover = normalizeString(frontmatter.cover);
  const youtube = normalizeString(frontmatter.youtube);
  const publishedAt =
    normalizeDate(frontmatter.publishedAt) ||
    normalizeDate(frontmatter.date) ||
    (stats ? formatDate(stats.mtime) : "1970-01-01");
  const updatedAt =
    normalizeDate(frontmatter.updatedAt) ||
    (stats ? formatDate(stats.mtime) : undefined);

  const contentWithVideo = ensureVideoToken(contentWithoutTitle, youtube || undefined);
  const contentWithLinks = linkifySourcesPath(contentWithVideo);
  const tags = normalizeTags(frontmatter.tags);
  const coverImage = cover
    ? {
        type: "image" as const,
        src: cover,
        alt: `${title}の外観`,
        credit: "User Provided",
      }
    : undefined;

  return {
    id: slug,
    slug,
    title,
    summary,
    body: summary,
    content: contentWithLinks,
    tags,
    pref: pref || undefined,
    type: type || undefined,
    credibility,
    danger,
    status: "published",
    category: "spots",
    publishedAt,
    updatedAt,
    coverImage,
    videoUrls: youtube ? [youtube] : undefined,
  } satisfies SpotEntry;
};

export const getSpotEntriesFromArticles = async (): Promise<SpotEntry[]> => {
  let entries: SpotEntry[] = [];

  try {
    const items = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
    const slugs = items.filter((item) => item.isDirectory()).map((item) => item.name);
    const results = await Promise.all(slugs.map((slug) => buildSpotEntry(slug)));
    entries = results.filter((item): item is SpotEntry => Boolean(item));
  } catch {
    return [];
  }

  return entries.sort((a, b) => {
    const dateDiff = Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
    if (dateDiff !== 0) return dateDiff;
    return a.slug.localeCompare(b.slug, "ja");
  });
};

export const getSpotEntryBySlug = async (slug: string) => {
  const entry = await buildSpotEntry(slug);
  return entry ?? null;
};
