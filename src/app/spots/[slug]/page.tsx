import { notFound } from "next/navigation";
import { spots } from "@/loaders";
import EntryLayout from "@/components/EntryLayout";
import { Badge, CardLink, TagChip } from "@/components/ui";

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

      const matchedTagList = item.tags.filter((tag) =>
        spot.tags.includes(tag)
      );

      return { item, matchTags, score, matchedTagList };
    })
    .filter((entry) => entry.score >= 1)
    .sort((a, b) => {
      const hasMatchA = a.matchTags >= 1 ? 1 : 0;
      const hasMatchB = b.matchTags >= 1 ? 1 : 0;
      const matchPriority = hasMatchB - hasMatchA;
      if (matchPriority !== 0) {
        return matchPriority;
      }
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      const matchDiff = b.matchTags - a.matchTags;
      if (matchDiff !== 0) {
        return matchDiff;
      }
      const dangerDiff = (b.item.danger ?? 0) - (a.item.danger ?? 0);
      if (dangerDiff !== 0) {
        return dangerDiff;
      }
      return a.item.title.localeCompare(b.item.title, "ja");
    });

  const relatedSpots = scoredSpots
    .filter((entry) => entry.matchTags >= 1)
    .slice(0, 6);

  const fallbackSpots = relatedSpots.length
    ? relatedSpots
    : scoredSpots.slice(0, 6);

  const relatedHeading = `関連スポット（${spot.tags.join(" / ")}）`;

  const getStarRating = (score: number) => {
    if (score >= 6) return "★★★";
    if (score >= 3) return "★★☆";
    return "★☆☆";
  };

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

  return (
    <EntryLayout
      backHref={backHref}
      title={spot.title}
      summary={spot.summary}
      updatedAt={spot.updatedAt}
      metaBadges={metaBadges}
      tags={spot.tags}
      sections={[
        {
          heading: "概要",
          body: spot.body ?? "準備中",
        },
        {
          heading: "特徴",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>分類: {spot.type ?? "不明"}</li>
              <li>エリア: {spot.pref ?? "不明"}</li>
              <li>主なタグ: {spot.tags.slice(0, 3).join(" / ")}</li>
            </ul>
          ),
        },
        {
          heading: "目撃・伝承",
          body:
            "夜間に足音が近づく、音が反響して人影が見えるなどの体験談が語られています。",
        },
        {
          heading: "安全メモ",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              {[...commonCaution, ...(spot.caution ?? [])].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ),
        },
        {
          heading: relatedHeading,
          body: fallbackSpots.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <p className="sm:col-span-2 text-xs text-zinc-500">
                ※関連度はタグ一致・種別一致・危険度差などから算出
              </p>
              {fallbackSpots.map(({ item, score, matchedTagList }) => (
                <CardLink
                  key={item.slug}
                  href={`/spots/${item.slug}`}
                  ariaLabel={`${item.title}の詳細へ`}
                  className="p-4"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>関連度: {getStarRating(score)}</span>
                    {item.pref && (
                      <TagChip variant="outline">
                        {item.pref}
                      </TagChip>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-zinc-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">{item.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-zinc-500">
                    {item.type && (
                      <TagChip variant="outline">
                        {item.type}
                      </TagChip>
                    )}
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
                  {matchedTagList.length > 0 && (
                    <p className="mt-2 text-xs text-zinc-500">
                      一致タグ: {matchedTagList.slice(0, 3).join(", ")}
                      {matchedTagList.length > 3 &&
                        ` +${matchedTagList.length - 3}`}
                    </p>
                  )}
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
