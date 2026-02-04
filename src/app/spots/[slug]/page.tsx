import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { spots } from "@/loaders";
import ArticleHeader from "@/components/article/ArticleHeader";
import PrevNext from "@/components/article/PrevNext";
import Related from "@/components/article/Related";
import ShareBar from "@/components/article/ShareBar";
import { Card } from "@/components/ui";
import EmbedMedia from "@/components/EmbedMedia";

export function generateStaticParams() {
  return spots.map((spot) => ({ slug: spot.slug }));
}

type SpotsDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SpotsDetailPage({
  params,
  searchParams,
}: SpotsDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const spot = spots.find((item) => item.slug === slug);

  if (!spot) {
    notFound();
  }

  const metaBadges = [
    ...(spot.pref ? [{ label: spot.pref, tone: "neutral" as const }] : []),
    ...(spot.type ? [{ label: spot.type, tone: "neutral" as const }] : []),
    ...(spot.credibility
      ? [{ label: `信憑性 ${spot.credibility}`, tone: "good" as const }]
      : []),
    ...(spot.danger
      ? [{ label: `危険度 ${spot.danger}`, tone: "warn" as const }]
      : []),
  ];

  const commonCaution = [
    "私有地への侵入はNG",
    "危険行為（廃墟侵入・無理な探索）はNG",
    "近隣住民への迷惑行為はNG",
  ];

  const sourceBody = spot.source?.length ? (
    <ul className="space-y-2">
      {spot.source.map((item) => (
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

  const scoredSpots = spots
    .filter((item) => item.slug !== spot.slug)
    .map((item) => {
      const matchTags = item.tags.filter((tag) => spot.tags.includes(tag))
        .length;
      const score =
        matchTags * 3 +
        (item.type && spot.type && item.type === spot.type ? 2 : 0) +
        (item.pref && spot.pref && item.pref === spot.pref ? 1 : 0) +
        (item.danger && spot.danger && Math.abs(item.danger - spot.danger) <= 1
          ? 1
          : 0) +
        (item.credibility &&
        spot.credibility &&
        item.credibility === spot.credibility
          ? 1
          : 0);

      return { item, matchTags, score };
    })
    .filter((entry) => entry.score >= 1)
    .sort((a, b) => b.score - a.score);

  const relatedSpots = scoredSpots.slice(0, 6).map(({ item }) => ({
    href: `/spots/${item.slug}`,
    title: item.title,
    summary: item.summary,
    tags: item.tags,
  }));

  const sortedSpots = [...spots].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );
  const currentIndex = sortedSpots.findIndex((item) => item.slug === spot.slug);
  const prevSpot = currentIndex > 0 ? sortedSpots[currentIndex - 1] : undefined;
  const nextSpot =
    currentIndex >= 0 && currentIndex < sortedSpots.length - 1
      ? sortedSpots[currentIndex + 1]
      : undefined;

  const backQuery = (() => {
    if (!resolvedSearchParams) return "";
    const params = new URLSearchParams();
    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item) params.append(key, item);
        });
        return;
      }
      if (typeof value === "string" && value.length > 0) {
        params.set(key, value);
      }
    });
    return params.toString();
  })();
  const backHref = backQuery ? `/spots?${backQuery}` : "/spots";
  const heroImage = spot.coverImage ?? spot.images?.[0];
  const rawContent = spot.content ?? spot.body;
  const videoUrl = spot.videoUrls?.[0];
  const hasVideoToken = rawContent.includes("{{VIDEO}}");
  const contentParts = rawContent.split("{{VIDEO}}");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="mb-6">
          <Link
            href={backHref}
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            ← 一覧へ戻る
          </Link>
        </div>

        <ArticleHeader
          categoryLabel="心霊スポット"
          title={spot.title}
          summary={spot.summary}
          publishedAt={spot.publishedAt}
          updatedAt={spot.updatedAt}
          metaBadges={metaBadges}
          tags={spot.tags}
        />

        <div className="mt-6 grid gap-6">
          <ShareBar />
          {heroImage && (
            <figure className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <Image
                src={heroImage.src}
                alt={heroImage.alt}
                width={heroImage.width ?? 1200}
                height={heroImage.height ?? 800}
                className="h-auto w-full object-cover"
                sizes="(max-width: 768px) 100vw, 960px"
              />
              {heroImage.credit && (
                <figcaption className="px-4 pb-3 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {heroImage.credit}
                </figcaption>
              )}
            </figure>
          )}
          <Card>
            <div className="prose max-w-none prose-zinc dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, children, ...props }) => {
                    const hasImage =
                      node?.children?.some(
                        (child) =>
                          child.type === "element" && child.tagName === "img"
                      ) ?? false;
                    if (hasImage) {
                      return <div {...props}>{children}</div>;
                    }
                    return <p {...props}>{children}</p>;
                  },
                  img: ({ node, ...props }) => (
                    <figure className="my-6">
                      <img className="w-full rounded-xl" {...props} />
                    </figure>
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="mb-4 mt-10 text-2xl font-bold" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="mb-3 mt-8 text-xl font-semibold" {...props} />
                  ),
                }}
              >
                {contentParts[0]}
              </ReactMarkdown>
              {hasVideoToken && videoUrl && (
                <div className="my-6">
                  <EmbedMedia url={videoUrl} />
                </div>
              )}
              {contentParts[1] && (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, children, ...props }) => {
                      const hasImage =
                        node?.children?.some(
                          (child) =>
                            child.type === "element" && child.tagName === "img"
                        ) ?? false;
                      if (hasImage) {
                        return <div {...props}>{children}</div>;
                      }
                      return <p {...props}>{children}</p>;
                    },
                    img: ({ node, ...props }) => (
                      <figure className="my-6">
                        <img className="w-full rounded-xl" {...props} />
                      </figure>
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="mb-4 mt-10 text-2xl font-bold" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="mb-3 mt-8 text-xl font-semibold" {...props} />
                    ),
                  }}
                >
                  {contentParts[1]}
                </ReactMarkdown>
              )}
              {!hasVideoToken && videoUrl && (
                <div className="my-6">
                  <EmbedMedia url={videoUrl} />
                </div>
              )}
            </div>
          </Card>
          <Card>
            <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                安全メモ
              </p>
              <ul className="list-disc space-y-1 pl-5">
                {[...commonCaution, ...(spot.caution ?? [])].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Card>
          <PrevNext
            prev={
              prevSpot
                ? {
                    href: `/spots/${prevSpot.slug}`,
                    title: prevSpot.title,
                    label: "前の記事",
                  }
                : undefined
            }
            next={
              nextSpot
                ? {
                    href: `/spots/${nextSpot.slug}`,
                    title: nextSpot.title,
                    label: "次の記事",
                  }
                : undefined
            }
          />
          <Related items={relatedSpots} heading="関連スポット" />
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
