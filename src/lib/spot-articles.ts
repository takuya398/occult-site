import { promises as fs } from "fs";
import { execSync } from "child_process";
import path from "path";
import type { SpotEntry, FaqItem } from "@/types";

type Frontmatter = Record<string, unknown>;

type ParsedArticle = {
  frontmatter: Frontmatter;
  body: string;
};

const ARTICLES_DIR = path.join(process.cwd(), "articles");

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

// ファイルのmtimeはVercelのビルド時チェックアウトで常に「今」になり当てにならないため、
// frontmatterに日付が無い記事はgitの追加日（最古コミット日時）を代わりに使う。
let gitAddedDateCache: Map<string, string> | null = null;

const getGitAddedDateMap = (): Map<string, string> => {
  if (gitAddedDateCache) return gitAddedDateCache;
  const map = new Map<string, string>();
  try {
    const output = execSync(
      'git log --diff-filter=A --name-only --format="COMMIT:%aI" -- articles',
      { cwd: process.cwd(), encoding: "utf8", maxBuffer: 1024 * 1024 * 50 }
    );
    let currentDate = "";
    for (const line of output.split("\n")) {
      if (line.startsWith("COMMIT:")) {
        currentDate = line.slice("COMMIT:".length);
      } else if (line.trim() && currentDate) {
        // git logは新しい順なので、同じパスは最後(=最古)の代入が残る
        map.set(line.trim(), currentDate);
      }
    }
  } catch {
    // git が使えない環境では無視してmtimeにフォールバック
  }
  gitAddedDateCache = map;
  return map;
};

const getGitAddedDate = (slug: string): Date | null => {
  const relPath = `articles/${slug}/index.md`;
  const iso = getGitAddedDateMap().get(relPath);
  return iso ? new Date(iso) : null;
};

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

// publishedAt専用: 時刻付き文字列はISO形式のまま保持してソート精度を上げる
const normalizeDatetime = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim()) {
    const v = value.trim();
    const parsed = Date.parse(v);
    if (!Number.isNaN(parsed)) {
      // 時刻成分がある場合（T または 日付部分10文字超）はISOで保持
      if (v.length > 10) {
        return new Date(parsed).toISOString();
      }
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

const parseFaqSection = (content: string): FaqItem[] | undefined => {
  // ## FAQ から次の ## か # または末尾までを取得
  const match = content.match(/(?:^|\n)## FAQ\s*\n([\s\S]*?)(?=\n## |\n# |$)/);
  if (!match) return undefined;

  const items: FaqItem[] = [];
  // ### Q. で始まるブロックに分割
  const blocks = match[1].split(/\n(?=### Q\.)/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed.startsWith("### Q.")) continue;

    const newlineIndex = trimmed.indexOf("\n");
    if (newlineIndex === -1) continue;

    const question = trimmed.slice("### Q.".length, newlineIndex).trim();
    const answerRaw = trimmed.slice(newlineIndex).trim();
    const answer = stripMarkdown(answerRaw);

    if (question && answer) items.push({ question, answer });
  }

  return items.length > 0 ? items : undefined;
};

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

const ensureMapToken = (content: string, hasMap: boolean): string => {
  if (!hasMap) return content;
  if (content.includes("{{MAP}}")) return content;
  // Insert {{MAP}} at the end of the "場所・アクセス" section, before the next heading
  const match = content.match(/(## 場所・アクセス[\s\S]*?)(\n## |\n# |$)/);
  if (match && match.index !== undefined) {
    const insertAt = match.index + match[1].length;
    return (
      content.slice(0, insertAt).trimEnd() +
      "\n\n{{MAP}}\n\n" +
      content.slice(insertAt).trimStart()
    );
  }
  // Fallback: prepend before {{VIDEO}}, or append
  if (content.includes("{{VIDEO}}")) {
    return content.replace("{{VIDEO}}", "{{MAP}}\n\n{{VIDEO}}");
  }
  return `${content}\n\n{{MAP}}\n`;
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

const readSources = async (slug: string): Promise<SpotEntry["source"]> => {
  const sourcesPath = path.join(ARTICLES_DIR, slug, "sources.md");
  let raw = "";
  try {
    raw = await fs.readFile(sourcesPath, "utf8");
  } catch {
    return undefined;
  }
  const items: NonNullable<SpotEntry["source"]> = [];
  for (const line of raw.split(/\r?\n/)) {
    const stripped = line.replace(/^[-*]\s*/, "").trim();
    if (!stripped) continue;
    // Markdown link: [title](url)
    const mdLink = stripped.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (mdLink) {
      items.push({ title: mdLink[1], url: mdLink[2] });
      continue;
    }
    // Plain URL
    if (/^https?:\/\//.test(stripped)) {
      try {
        const { hostname } = new URL(stripped);
        items.push({ title: hostname, url: stripped });
      } catch {
        items.push({ title: stripped, url: stripped });
      }
      continue;
    }
    // Plain text (no URL)
    if (stripped && !stripped.startsWith("#")) {
      items.push({ title: stripped });
    }
  }
  return items.length ? items : undefined;
};

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
  const cover = normalizeString(frontmatter.cover) || normalizeString(frontmatter.coverImage) || normalizeString(frontmatter.heroImage);
  const ruby = normalizeString(frontmatter.ruby) || undefined;
  const youtube = normalizeString(frontmatter.youtube);
  const gitAddedDate = getGitAddedDate(slug);
  const publishedAt =
    normalizeDatetime(frontmatter.publishedAt) ||
    normalizeDate(frontmatter.date) ||
    (gitAddedDate ? formatDate(gitAddedDate) : null) ||
    (stats ? formatDate(stats.mtime) : "1970-01-01");
  const updatedAt =
    normalizeDate(frontmatter.updatedAt) ||
    (gitAddedDate ? formatDate(gitAddedDate) : null) ||
    (stats ? formatDate(stats.mtime) : undefined);

  const contentWithVideo = ensureVideoToken(contentWithoutTitle, youtube || undefined);
  const contentWithLinks = linkifySourcesPath(contentWithVideo);

  const mapQuery = normalizeString(frontmatter.mapQuery) || undefined;
  const latRaw = frontmatter.lat;
  const lat = typeof latRaw === "number" ? latRaw : undefined;
  const lngRaw = frontmatter.lng;
  const lng = typeof lngRaw === "number" ? lngRaw : undefined;
  const hasMap = !!(mapQuery || (lat !== undefined && lng !== undefined));
  const contentWithMap = ensureMapToken(contentWithLinks, hasMap);

  const tags = normalizeTags(frontmatter.tags);
  const source = await readSources(slug);
  const faq = parseFaqSection(contentWithoutTitle);
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
    ruby,
    summary,
    body: summary,
    content: contentWithMap,
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
    source,
    faq,
    mapQuery,
    lat,
    lng,
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
