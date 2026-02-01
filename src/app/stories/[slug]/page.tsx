import { notFound } from "next/navigation";
import { stories } from "@/data/loaders";
import EntryLayout from "@/components/EntryLayout";
import { Badge, CardLink, TagChip } from "@/components/ui";

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
              className="text-sm text-zinc-700 underline decoration-zinc-300 underline-offset-4"
              target="_blank"
              rel="noreferrer"
            >
              {item.title}
            </a>
          ) : (
            <span className="text-sm text-zinc-600">{item.title}</span>
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
    .sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;
      const matchDiff = b.matchTagCount - a.matchTagCount;
      if (matchDiff !== 0) return matchDiff;
      const dangerDiff = (b.item.danger ?? 0) - (a.item.danger ?? 0);
      if (dangerDiff !== 0) return dangerDiff;
      return a.item.title.localeCompare(b.item.title, "ja");
    })
    .slice(0, 5);

  const relatedTagSet = new Set(
    scoredStories.flatMap((entry) => entry.matchTags)
  );
  const relatedHeading = relatedTagSet.size
    ? `関連する話（${Array.from(relatedTagSet).join("/")}）`
    : "関連する話";

  const getStarRating = (score: number) => {
    if (score >= 6) return "★★★";
    if (score >= 3) return "★★☆";
    return "★☆☆";
  };

  return (
    <EntryLayout
      backHref={backHref}
      title={story.title}
      summary={story.summary}
      updatedAt={story.updatedAt}
      metaBadges={metaBadges}
      tags={story.tags}
      sections={[
        {
          heading: "概要",
          body: story.body ?? "準備中",
        },
        {
          heading: "特徴",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>ジャンル: {story.type ?? "不明"}</li>
              <li>主なタグ: {story.tags.slice(0, 3).join(" / ")}</li>
              <li>語り口: 体験談・伝承ミックス</li>
            </ul>
          ),
        },
        {
          heading: "目撃・伝承",
          body:
            "口伝や掲示板での共有を中心に広がったとされる内容。地域差のあるバリエーションが存在します。",
        },
        {
          heading: "安全メモ",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              {[...commonCaution, ...(story.caution ?? [])].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ),
        },
        {
          heading: relatedHeading,
          body: scoredStories.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {scoredStories.map(({ item, score }) => (
                <CardLink
                  key={item.slug}
                  href={`/stories/${item.slug}`}
                  ariaLabel={`${item.title}の詳細へ`}
                  className="p-4"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>関連度: {getStarRating(score)}</span>
                    {item.type && (
                      <TagChip variant="outline">
                        {item.type}
                      </TagChip>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-zinc-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">{item.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {item.credibility && (
                      <Badge tone="emerald">
                        信憑性 {item.credibility}
                      </Badge>
                    )}
                    {item.danger && (
                      <Badge tone="rose">
                        危険度 {item.danger}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 3).map((tag) => (
                      <TagChip key={tag}>
                        {tag}
                      </TagChip>
                    ))}
                  </div>
                </CardLink>
              ))}
            </div>
          ) : (
            "関連項目はまだありません"
          ),
        },
        {
          heading: "出典",
          body: sourceBody,
        },
      ]}
    />
  );
}
