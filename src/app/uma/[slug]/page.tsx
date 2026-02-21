import Link from "next/link";
import { notFound } from "next/navigation";
import { umas } from "@/loaders";
import ArticleHeader from "@/components/article/ArticleHeader";
import ImageGallery from "@/components/article/ImageGallery";
import PrevNext from "@/components/article/PrevNext";
import Related from "@/components/article/Related";
import ShareBar from "@/components/article/ShareBar";
import { Card } from "@/components/ui";
import EmbedMedia from "@/components/EmbedMedia";

export function generateStaticParams() {
  return umas.map((uma) => ({ slug: uma.slug }));
}

type UmaDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function UmaDetailPage({
  params,
  searchParams,
}: UmaDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const uma = umas.find((item) => item.slug === slug);

  if (!uma) {
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
  const backHref = backQuery ? `/uma?${backQuery}` : "/uma";

  const metaBadges = [
    ...(uma.type ? [{ label: uma.type, tone: "neutral" as const }] : []),
    ...(uma.region ? [{ label: uma.region, tone: "neutral" as const }] : []),
    ...(uma.existence_rank
      ? [{ label: `実在度 ${uma.existence_rank}`, tone: "neutral" as const }]
      : []),
    ...(uma.evidence_rank
      ? [{ label: `証拠強度 ${uma.evidence_rank}`, tone: "good" as const }]
      : []),
    ...(uma.danger
      ? [{ label: `危険度 ${uma.danger}`, tone: "warn" as const }]
      : []),
  ];

  const commonCaution = [
    "私有地への侵入はNG",
    "危険行為（廃墟侵入・無理な探索）はNG",
    "近隣住民への迷惑行為はNG",
  ];

  const sourceBody = uma.source?.length ? (
    <ul className="space-y-2">
      {uma.source.map((item) => (
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

  const scoredUmas = umas
    .filter((item) => item.slug !== uma.slug)
    .map((item) => {
      const matchTags = item.tags.filter((tag) => uma.tags.includes(tag));
      const matchTagCount = matchTags.length;
      const score =
        matchTagCount * 2 +
        (item.type && uma.type && item.type === uma.type ? 1 : 0) +
        (item.evidence_rank === uma.evidence_rank ? 1 : 0) +
        (item.danger && uma.danger && Math.abs(item.danger - uma.danger) <= 1
          ? 1
          : 0);

      return { item, matchTags, matchTagCount, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const relatedUmas = scoredUmas.map(({ item }) => ({
    href: `/uma/${item.slug}`,
    title: item.title,
    summary: item.summary,
    tags: item.tags,
  }));

  const sortedUmas = [...umas].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );
  const currentIndex = sortedUmas.findIndex((item) => item.slug === uma.slug);
  const prevUma = currentIndex > 0 ? sortedUmas[currentIndex - 1] : undefined;
  const nextUma =
    currentIndex >= 0 && currentIndex < sortedUmas.length - 1
      ? sortedUmas[currentIndex + 1]
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
          categoryLabel="UMA"
          title={uma.title}
          summary={uma.summary}
          publishedAt={uma.publishedAt}
          updatedAt={uma.updatedAt}
          metaBadges={metaBadges}
          tags={uma.tags}
        />

        <div className="mt-6 grid gap-6">
          <ShareBar />
          <ImageGallery coverImage={uma.coverImage} images={uma.images} />
          <Card>
            <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
              <p>{uma.body}</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>分類: {uma.type ?? "不明"}</li>
                <li>主なタグ: {uma.tags.slice(0, 3).join(" / ")}</li>
                <li>目撃情報: 断続的に報告</li>
              </ul>
            </div>
          </Card>
          <Card>
            <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                安全メモ
              </p>
              <ul className="list-disc space-y-1 pl-5">
                {[...commonCaution, ...(uma.caution ?? [])].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Card>
          {uma.videoUrls && uma.videoUrls.length > 0 && (
            <section className="space-y-4">
              {uma.videoUrls.map((url, index) => (
                <EmbedMedia key={`${url}-${index}`} url={url} />
              ))}
            </section>
          )}
          <PrevNext
            prev={
              prevUma
                ? {
                    href: `/uma/${prevUma.slug}`,
                    title: prevUma.title,
                    label: "前の記事",
                  }
                : undefined
            }
            next={
              nextUma
                ? {
                    href: `/uma/${nextUma.slug}`,
                    title: nextUma.title,
                    label: "次の記事",
                  }
                : undefined
            }
          />
          <Related items={relatedUmas} heading="関連UMA" />
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
