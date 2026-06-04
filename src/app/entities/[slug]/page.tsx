import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { entities } from "@/loaders";
import Breadcrumbs from "@/components/Breadcrumbs";
// TODO: URL名整理メモ — /entities は将来 /yokai や /kaiki に変更検討。
// ナビ表示「怪異・妖怪」はラベルのみ変更済み。URL は現状維持。
import ArticleHeader from "@/components/article/ArticleHeader";
import ImageGallery from "@/components/article/ImageGallery";
import MarkdownContent from "@/components/article/MarkdownContent";
import UmaToc from "@/components/article/UmaToc";
import PrevNext from "@/components/article/PrevNext";
import Related from "@/components/article/Related";
import ShareBar from "@/components/article/ShareBar";
import { Card } from "@/components/ui";
import EmbedMedia from "@/components/EmbedMedia";
import CommentSection from "@/components/comments/CommentSection";

export function generateStaticParams() {
  return entities.map((uma) => ({ slug: uma.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const uma = entities.find((item) => item.slug === slug);

  if (!uma) {
    return {
      title: "ページが見つかりません",
      description: "お探しのページは見つかりませんでした。",
    };
  }

  const description = uma.summary.slice(0, 120);
  const ogImage = uma.coverImage?.src
    ? [{ url: uma.coverImage.src, width: 1200, height: 630, alt: uma.title }]
    : undefined;

  return {
    title: uma.title,
    description,
    openGraph: {
      title: uma.title,
      description,
      url: `https://occultpedia.jp/entities/${slug}`,
      type: "article",
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title: uma.title,
      description,
      images: uma.coverImage?.src ? [uma.coverImage.src] : undefined,
    },
  };
}

type EntityDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EntityDetailPage({
  params,
}: EntityDetailPageProps) {
  const { slug } = await params;
  const uma = entities.find((item) => item.slug === slug);

  if (!uma) {
    notFound();
  }


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

  const scoredUmas = entities
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
    href: `/entities/${item.slug}`,
    title: item.title,
    summary: item.summary,
    tags: item.tags,
  }));

  const sortedUmas = [...entities].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );
  const currentIndex = sortedUmas.findIndex((item) => item.slug === uma.slug);
  const prevUma = currentIndex > 0 ? sortedUmas[currentIndex - 1] : undefined;
  const nextUma =
    currentIndex >= 0 && currentIndex < sortedUmas.length - 1
      ? sortedUmas[currentIndex + 1]
      : undefined;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: uma.title,
    description: uma.summary.slice(0, 160),
    image: uma.coverImage?.src
      ? [uma.coverImage.src]
      : ["https://occultpedia.jp/og-image.jpg"],
    datePublished: uma.publishedAt,
    dateModified: uma.updatedAt ?? uma.publishedAt,
    author: {
      "@type": "Organization",
      name: "オカルト図鑑",
      url: "https://occultpedia.jp",
    },
    publisher: {
      "@type": "Organization",
      name: "オカルト図鑑",
      url: "https://occultpedia.jp",
      logo: {
        "@type": "ImageObject",
        url: "https://occultpedia.jp/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://occultpedia.jp/entities/${slug}`,
    },
  };

  const faqJsonLd =
    uma.faq && uma.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: uma.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <Breadcrumbs
          items={[
            { label: "トップ", href: "/" },
            { label: "怪異・妖怪", href: "/entities" },
            { label: uma.title },
          ]}
        />

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
          {uma.contentMd ? (
            <>
              <UmaToc contentMd={uma.contentMd} />
              <div className="rounded-xl border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <MarkdownContent content={uma.contentMd} />
              </div>
            </>
          ) : (
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
          )}
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
                    href: `/entities/${prevUma.slug}`,
                    title: prevUma.title,
                    label: "前の記事",
                  }
                : undefined
            }
            next={
              nextUma
                ? {
                    href: `/entities/${nextUma.slug}`,
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
          <CommentSection slug={uma.slug} articleType="entities" />
        </div>
      </div>
    </div>
    </>
  );
}

