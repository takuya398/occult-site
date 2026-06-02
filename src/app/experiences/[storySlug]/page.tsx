import { type Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";
import ScareStars from "@/components/experiences/ScareStars";
import LikeButton from "@/components/experiences/LikeButton";
import ReportButton from "@/components/experiences/ReportButton";
import ExperienceComments from "@/components/experiences/ExperienceComments";
import { formatBoardDate, formatStoryNo } from "@/lib/experiences/format";
import { buildExperienceUrl, parseStoryNoFromParam } from "@/lib/experiences/slugify";
import type { Experience } from "@/lib/experiences/types";

type Props = { params: Promise<{ storySlug: string }> };

async function getExperience(storyNo: number): Promise<Experience | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("experiences")
    .select("*")
    .eq("story_no", storyNo)
    .single();
  return data as Experience | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storySlug } = await params;
  const storyNo = parseStoryNoFromParam(storySlug);
  if (!storyNo) return {};

  const exp = await getExperience(storyNo);
  if (!exp || exp.status !== "published") {
    return { robots: { index: false, follow: false } };
  }

  const locationLabel = exp.place_name ? `${exp.prefecture}・${exp.place_name}` : exp.prefecture;
  const description = `${locationLabel}で投稿された心霊体験談。「${exp.body.slice(0, 80)}...」`;

  return {
    title: `${exp.title}｜${exp.prefecture}の心霊体験談`,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title: `${exp.title}｜${exp.prefecture}の心霊体験談｜オカルトペディア`,
      description,
      images: [{ url: "/og/experience-default.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${exp.title}｜${exp.prefecture}の心霊体験談｜オカルトペディア`,
      description,
      images: ["/og/experience-default.jpg"],
    },
  };
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { storySlug } = await params;
  const storyNo = parseStoryNoFromParam(storySlug);
  if (!storyNo) notFound();

  const exp = await getExperience(storyNo);
  if (!exp) notFound();

  // slug が正規と不一致なら 301 リダイレクト
  const canonicalParam = `${formatStoryNo(exp.story_no)}-${exp.slug}`;
  if (storySlug !== canonicalParam) {
    redirect(buildExperienceUrl(exp.story_no, exp.slug));
  }

  // pending/hidden/rejected は noindex ページとして表示（管理者は見られる）
  const isPublic = exp.status === "published";
  if (!isPublic) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">この体験談は現在非公開です。</p>
      </div>
    );
  }

  const locationLabel = exp.place_name ? `${exp.prefecture}｜${exp.place_name}` : exp.prefecture;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: exp.title,
    datePublished: exp.published_at ?? exp.created_at,
    author: { "@type": "Person", name: exp.display_name },
    text: exp.body.slice(0, 500),
    url: `https://occultpedia.jp${buildExperienceUrl(exp.story_no, exp.slug)}`,
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/LikeAction",
      userInteractionCount: exp.like_count,
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-300">トップ</Link>
          {" / "}
          <Link href="/experiences" className="hover:text-zinc-300">心霊体験談</Link>
          {" / "}
          <span>No.{formatStoryNo(exp.story_no)}</span>
        </nav>

        {/* 本文カード（掲示板風） */}
        <article className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          {/* ヘッダー行 */}
          <p className="mb-1 font-mono text-xs text-zinc-500">
            No.{formatStoryNo(exp.story_no)}：
            <span className="text-green-400">{exp.display_name}</span>
            ：{formatBoardDate(exp.created_at)}
          </p>
          <p className="mb-4 text-xs text-zinc-500">
            {locationLabel}｜怖さ{" "}
            <ScareStars level={exp.scare_level} className="text-amber-400" />
            ｜{exp.genre}
          </p>

          {/* タイトル */}
          <h1 className="mb-5 text-xl font-bold text-zinc-100 sm:text-2xl">{exp.title}</h1>

          {/* 本文 */}
          <div className="mb-6 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
            {exp.body}
          </div>

          {/* アクション */}
          <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-4">
            <LikeButton
              targetType="experience"
              targetId={exp.id}
              initialCount={exp.like_count}
              storageKey={`e-${exp.id}`}
            />
            <span className="text-xs text-zinc-500">コメント {exp.comment_count}件</span>
            <ReportButton targetType="experience" targetId={exp.id} />
          </div>
        </article>

        {/* 関連スポット */}
        {exp.related_spot_slug && (
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm">
            <p className="text-xs text-zinc-500 mb-1">関連スポット</p>
            <Link href={`/spots/${exp.related_spot_slug}`} className="text-violet-400 hover:underline">
              {exp.related_spot_slug} の記事を見る →
            </Link>
          </div>
        )}

        {/* コメント */}
        <ExperienceComments experienceId={exp.id} />
      </div>
    </div>
  );
}
