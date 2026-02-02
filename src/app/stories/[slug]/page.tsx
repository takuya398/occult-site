import Link from "next/link";
import { notFound } from "next/navigation";
import { stories } from "@/loaders";
import ArticleHeader from "@/components/article/ArticleHeader";
import Embeds from "@/components/article/Embeds";
import ImageGallery from "@/components/article/ImageGallery";
import PrevNext from "@/components/article/PrevNext";
import Related from "@/components/article/Related";
import ShareBar from "@/components/article/ShareBar";
import { Card } from "@/components/ui";

export function generateStaticParams() {
  return stories.map((story) => ({ slug: story.slug }));
}

type StoriesDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function StoriesDetailPage({
  params,
  searchParams,
}: StoriesDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const story = stories.find((item) => item.slug === slug);

  if (!story) {
    notFound();
  }

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
  const backHref = backQuery ? `/stories?${backQuery}` : "/stories";

  const metaBadges = [
    ...(story.type ? [{ label: story.type, tone: "neutral" as const }] : []),
    ...(story.credibility
      ? [{ label: `信憑性 ${story.credibility}`, tone: "good" as const }]
      : []),
    ...(story.danger
      ? [{ label: `危険度 ${story.danger}`, tone: "warn" as const }]
      : []),
  ];

  const commonCaution = [
    "私有地への侵入はNG",
    "危険行為（廃墟侵入・無理な探索）はNG",
    "近隣住民への迷惑行為はNG",
  ];

  const sourceBody = story.source?.length ? (
    <ul className="space-y-2">
      {story.source.map((item) => (
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

  const scoredStories = stories
    .filter((item) => item.slug !== story.slug)
    .map((item) => {
      const matchTags = item.tags.filter((tag) => story.tags.includes(tag));
      const matchTagCount = matchTags.length;
      const score =
        matchTagCount * 2 +
        (item.type && story.type && item.type === story.type ? 1 : 0) +
        (item.credibility &&
        story.credibility &&
        item.credibility === story.credibility
          ? 1
          : 0) +
        (item.danger && story.danger && Math.abs(item.danger - story.danger) <= 1
          ? 1
          : 0);

      return { item, matchTags, matchTagCount, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const relatedStories = scoredStories.map(({ item }) => ({
    href: `/stories/${item.slug}`,
    title: item.title,
    summary: item.summary,
    tags: item.tags,
  }));

  const sortedStories = [...stories].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );
  const currentIndex = sortedStories.findIndex(
    (item) => item.slug === story.slug
  );
  const prevStory =
    currentIndex > 0 ? sortedStories[currentIndex - 1] : undefined;
  const nextStory =
    currentIndex >= 0 && currentIndex < sortedStories.length - 1
      ? sortedStories[currentIndex + 1]
      : undefined;

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
          categoryLabel="怪談・都市伝説"
          title={story.title}
          summary={story.summary}
          publishedAt={story.publishedAt}
          updatedAt={story.updatedAt}
          metaBadges={metaBadges}
          tags={story.tags}
        />

        <div className="mt-6 grid gap-6">
          <ShareBar />
          <ImageGallery coverImage={story.coverImage} images={story.images} />
          <Card>
            <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
              <p>{story.body}</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>ジャンル: {story.type ?? "不明"}</li>
                <li>主なタグ: {story.tags.slice(0, 3).join(" / ")}</li>
                <li>語り口: 体験談・伝承ミックス</li>
              </ul>
            </div>
          </Card>
          <Card>
            <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                安全メモ
              </p>
              <ul className="list-disc space-y-1 pl-5">
                {[...commonCaution, ...(story.caution ?? [])].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Card>
          <Embeds embeds={story.embeds} />
          <PrevNext
            prev={
              prevStory
                ? {
                    href: `/stories/${prevStory.slug}`,
                    title: prevStory.title,
                    label: "前の記事",
                  }
                : undefined
            }
            next={
              nextStory
                ? {
                    href: `/stories/${nextStory.slug}`,
                    title: nextStory.title,
                    label: "次の記事",
                  }
                : undefined
            }
          />
          <Related items={relatedStories} heading="関連記事" />
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
