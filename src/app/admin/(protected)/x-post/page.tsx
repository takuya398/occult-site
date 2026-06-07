import { getSpotEntriesFromArticles } from "@/lib/spot-articles";
import { createAdminClient } from "@/lib/supabase-admin";
import XPostClient from "./XPostClient";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

type XPostRecord = {
  slug: string;
  x_post_id: string;
  x_posted_at: string;
};

export default async function XPostPage() {
  const [spots, xPostsRes] = await Promise.all([
    getSpotEntriesFromArticles(),
    createAdminClient()
      .from("x_posts")
      .select("slug, x_post_id, x_posted_at")
      .order("x_posted_at", { ascending: false }),
  ]);

  const xPostsMap: Record<string, { x_post_id: string; x_posted_at: string }> = {};
  for (const p of (xPostsRes.data ?? []) as XPostRecord[]) {
    xPostsMap[p.slug] = { x_post_id: p.x_post_id, x_posted_at: p.x_posted_at };
  }

  const articles = spots.map((s) => ({
    slug: s.slug,
    title: s.title,
    summary: s.summary,
    tags: s.tags,
    publishedAt: s.publishedAt,
    posted: xPostsMap[s.slug] ?? null,
  }));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-1 text-2xl font-bold">X 投稿</h1>
        <p className="mb-8 text-sm text-zinc-400">
          記事を選択して投稿文を確認・編集し、Xに投稿します。
        </p>
        <XPostClient articles={articles} />
      </div>
    </div>
  );
}
