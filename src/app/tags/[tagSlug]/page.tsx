import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TAG_SLUG_MAP, TAG_SLUG_REVERSE } from "@/data/uma-tag-slugs";
import TagDetailClient from "./TagDetailClient";

export function generateStaticParams() {
  return Object.values(TAG_SLUG_MAP).map((slug) => ({ tagSlug: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tagSlug: string }>;
}): Promise<Metadata> {
  const { tagSlug } = await params;
  const tagName = TAG_SLUG_REVERSE[tagSlug];
  if (!tagName) return {};
  return {
    title: `${tagName}のUMA一覧 | UMA図鑑`,
    description: `タグ「${tagName}」に該当するUMAを実在度・証拠強度・危険度で一覧化。`,
  };
}

export default async function TagDetailPage({
  params,
}: {
  params: Promise<{ tagSlug: string }>;
}) {
  const { tagSlug } = await params;
  const tagName = TAG_SLUG_REVERSE[tagSlug];

  if (!tagName) {
    notFound();
  }

  return <TagDetailClient tagName={tagName} />;
}
