import Link from "next/link";
import { notFound } from "next/navigation";
import { legends } from "@/loaders";
import ArticleHeader from "@/components/article/ArticleHeader";
import { LegendBody } from "@/components/article/LegendBody";
import PrevNext from "@/components/article/PrevNext";
import Related from "@/components/article/Related";
import ShareBar from "@/components/article/ShareBar";
import { Card } from "@/components/ui";
import EmbedMedia from "@/components/EmbedMedia";
import LegendArticleShell from "@/components/legends/LegendArticleShell";

const TYPE_LABELS: Record<string, string> = {
  kaidan: "怪談",
  urban: "都市伝説",
  "imi-kowa": "意味怖",
};

export function generateStaticParams() {
  return legends.map((item) => ({ slug: item.slug }));
}

type LegendsDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LegendsDetailPage({
  params,
  searchParams,
}: LegendsDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const item = legends.find((l) => l.slug === slug);

  if (!item) {
    notFound();
  }

  const backQuery = (() => {
    if (!resolvedSearchParams) return "";
    const p = new URLSearchParams();
    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => { if (v) p.append(key, v); });
        return;
      }
      if (typeof value === "string" && value.length > 0) {
        p.set(key, value);
      }
    });
    return p.toString();
  })();
  const backHref = backQuery ? `/legends?${backQuery}` : "/legends";

  const metaBadges = [
    { label: TYPE_LABELS[item.type] ?? item.type, tone: "neutral" as const },
    ...(item.danger !== undefined
      ? [{ label: `危険度 ${item.danger}/5`, tone: "warn" as const }]
      : []),
    ...(item.credibility
      ? [{ label: `信憑性 ${item.credibility}`, tone: "good" as const }]
      : []),
  ];

  // sources: new string[] format or legacy source[] format
  const sourceBody = (() => {
    if (item.sources && item.sources.length > 0) {
      return (
        <ul className="space-y-2">
          {item.sources.map((url) => (
            <li key={url}>
              <a
                href={url}
                className="text-sm text-zinc-700 underline decoration-zinc-300 underline-offset-4 dark:text-zinc-300"
                target="_blank"
                rel="noreferrer"
              >
                {url}
              </a>
            </li>
          ))}
        </ul>
      );
    }
    if (item.source && item.source.length > 0) {
      return (
        <ul className="space-y-2">
          {item.source.map((s) => (
            <li key={s.title}>
              {s.url ? (
                <a
                  href={s.url}
                  className="text-sm text-zinc-700 underline decoration-zinc-300 underline-offset-4 dark:text-zinc-300"
                  target="_blank"
                  rel="noreferrer"
                >
                  {s.title}
                </a>
              ) : (
                <span className="text-sm text-zinc-600 dark:text-zinc-300">{s.title}</span>
              )}
            </li>
          ))}
        </ul>
      );
    }
    return <span className="text-sm text-zinc-600 dark:text-zinc-400">準備中</span>;
  })();

  // PrevNext: sorted by publishedAt desc
  const sortedLegends = [...legends].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );
  const currentIndex = sortedLegends.findIndex((l) => l.slug === slug);
  const prevItem = currentIndex > 0 ? sortedLegends[currentIndex - 1] : undefined;
  const nextItem =
    currentIndex >= 0 && currentIndex < sortedLegends.length - 1
      ? sortedLegends[currentIndex + 1]
      : undefined;

  // Related: scored by tag overlap + type + credibility + danger proximity
  const scoredRelated = legends
    .filter((l) => l.slug !== slug)
    .map((l) => {
      const matchTags = l.tags.filter((tag) => item.tags.includes(tag));
      const score =
        matchTags.length * 2 +
        (l.type === item.type ? 1 : 0) +
        (l.credibility && item.credibility && l.credibility === item.credibility ? 1 : 0) +
        (l.danger !== undefined &&
        item.danger !== undefined &&
        Math.abs(l.danger - item.danger) <= 1
          ? 1
          : 0);
      return { item: l, score };
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ item: l }) => ({
      href: `/legends/${l.slug}`,
      title: l.title,
      summary: l.summary,
      tags: l.tags,
    }));

  return (
    <LegendArticleShell>
      <div className="mb-6">
          <Link
            href={backHref}
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            ← 一覧へ戻る
          </Link>
        </div>

        <ArticleHeader
          categoryLabel="怪談・都市伝説"
          title={item.title}
          summary={item.excerpt ?? item.summary}
          publishedAt={item.publishedAt}
          updatedAt={item.updatedAt}
          metaBadges={metaBadges}
          tags={item.tags}
        />

        <div className="mt-6 grid gap-6">
          <ShareBar />

          {/* 基本データ */}
          <Card>
            <p className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              基本データ
            </p>
            <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <li>
                <span className="text-zinc-500">種別：</span>
                {TYPE_LABELS[item.type] ?? item.type}
              </li>
              {item.danger !== undefined && (
                <li>
                  <span className="text-zinc-500">危険度：</span>
                  {item.danger}/5
                </li>
              )}
              {item.credibility && (
                <li>
                  <span className="text-zinc-500">信憑性：</span>
                  {item.credibility}
                </li>
              )}
              {item.stage && (
                <li>
                  <span className="text-zinc-500">舞台：</span>
                  {item.stage}
                </li>
              )}
              {item.motif && (
                <li>
                  <span className="text-zinc-500">モチーフ：</span>
                  {item.motif}
                </li>
              )}
              {item.tone && (
                <li>
                  <span className="text-zinc-500">読後感：</span>
                  {item.tone}
                </li>
              )}
            </ul>
          </Card>

          {/* 本文 */}
          <Card>
            <LegendBody slug={item.slug} body={item.body ?? item.content ?? ""} />
          </Card>

          {item.videoUrls && item.videoUrls.length > 0 && (
            <section className="space-y-4">
              {item.videoUrls.map((url, index) => (
                <EmbedMedia key={`${url}-${index}`} url={url} />
              ))}
            </section>
          )}

          <PrevNext
            prev={
              prevItem
                ? { href: `/legends/${prevItem.slug}`, title: prevItem.title, label: "前の記事" }
                : undefined
            }
            next={
              nextItem
                ? { href: `/legends/${nextItem.slug}`, title: nextItem.title, label: "次の記事" }
                : undefined
            }
          />

          <Related items={scoredRelated} heading="関連記事" />

          {/* 出典 */}
          <Card>
            <p className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              出典
            </p>
            {sourceBody}
          </Card>
        </div>
    </LegendArticleShell>
  );
}
