import { getSpotEntriesFromArticles } from "@/lib/spot-articles";
import XPostClient from "./XPostClient";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function XPostPage() {
  const spots = await getSpotEntriesFromArticles();

  const articles = spots.map((s) => ({
    slug: s.slug,
    title: s.title,
    summary: s.summary,
    tags: s.tags,
    publishedAt: s.publishedAt,
  }));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-1 text-2xl font-bold">X 投稿文ジェネレーター</h1>
        <p className="mb-8 text-sm text-zinc-400">
          記事を選択して投稿文を確認・編集し、Xに投稿してください。
        </p>
        <XPostClient articles={articles} />
      </div>
    </div>
  );
}
