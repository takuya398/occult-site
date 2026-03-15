import { createAdminClient } from "@/lib/supabase-admin";
import CommentsClient, { type AdminComment } from "./CommentsClient";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, author_name, body, article_type, slug, created_at, is_approved, good_count")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
        <p className="text-red-600">コメントの取得に失敗しました: {error.message}</p>
      </div>
    );
  }

  const comments: AdminComment[] = data ?? [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">コメント管理</h1>
          <p className="mt-1 text-sm text-zinc-500">
            合計 {comments.length} 件（未承認 {comments.filter((c) => !c.is_approved).length} 件）
          </p>
        </div>
        <CommentsClient comments={comments} />
      </div>
    </div>
  );
}
