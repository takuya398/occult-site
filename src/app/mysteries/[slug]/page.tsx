import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mysteries } from "@/loaders";
import ArticleHeader from "@/components/article/ArticleHeader";
import MarkdownContent from "@/components/article/MarkdownContent";
import { Card } from "@/components/ui";

export function generateStaticParams() {
  return mysteries.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mystery = mysteries.find((item) => item.slug === slug);

  if (!mystery) {
    return {
      title: "ページが見つかりません",
      description: "お探しのページは見つかりませんでした。",
    };
  }

  const description = mystery.summary.slice(0, 120);
  const ogImage = mystery.coverImage?.src
    ? [{ url: mystery.coverImage.src, width: 1200, height: 630, alt: mystery.title }]
    : undefined;

  return {
    title: mystery.title,
    description,
    openGraph: {
      title: mystery.title,
      description,
      url: `https://occultpedia.jp/mysteries/${slug}`,
      type: "article",
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title: mystery.title,
      description,
      images: mystery.coverImage?.src ? [mystery.coverImage.src] : undefined,
    },
  };
}

type MysteryDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MysteryDetailPage({
  params,
}: MysteryDetailPageProps) {
  const { slug } = await params;
  const mystery = mysteries.find((item) => item.slug === slug);

  if (!mystery) {
    notFound();
  }

  const metaBadges = [
    ...(mystery.era ? [{ label: mystery.era, tone: "neutral" as const }] : []),
    ...(mystery.location
      ? [{ label: mystery.location, tone: "neutral" as const }]
      : []),
    ...(mystery.credibility
      ? [{ label: `信憑性 ${mystery.credibility}`, tone: "good" as const }]
      : []),
  ];

  const sourceBody = mystery.source?.length ? (
    <ul className="space-y-2">
      {mystery.source.map((item) => (
        <li key={item.title}>
          {item.url ? (
            <a
              href={item.url}
              className="text-sm text-zinc-700 underline decoration-zinc-300 underline-offset-4 dark:text-zinc-300"
              target="_blank"
              rel="noreferrer"
            >
              {item.title}
            </a>
          ) : (
            <span className="text-sm text-zinc-600 dark:text-zinc-300">
              {item.title}
            </span>
          )}
        </li>
      ))}
    </ul>
  ) : (
    "準備中"
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="mb-6">
          <Link
            href="/mysteries"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            ← 一覧へ戻る
          </Link>
        </div>

        <ArticleHeader
          categoryLabel="怪事件・ミステリー"
          title={mystery.title}
          summary={mystery.summary}
          publishedAt={mystery.publishedAt}
          updatedAt={mystery.updatedAt}
          metaBadges={metaBadges}
          tags={mystery.tags}
        />

        <div className="mt-6 grid gap-6">
          {mystery.contentMd ? (
            <div className="rounded-xl border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
              <MarkdownContent content={mystery.contentMd} />
            </div>
          ) : (
            <Card>
              <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                <p>{mystery.body}</p>
                <ul className="list-disc space-y-1 pl-5">
                  {mystery.era && <li>時代・年代: {mystery.era}</li>}
                  {mystery.location && <li>場所: {mystery.location}</li>}
                  <li>主なタグ: {mystery.tags.slice(0, 3).join(" / ")}</li>
                </ul>
              </div>
            </Card>
          )}
          <Card>
            <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                出典
              </p>
              {sourceBody}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
