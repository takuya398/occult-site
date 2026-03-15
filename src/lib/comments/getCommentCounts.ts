import { supabase } from "@/lib/supabase";

/**
 * 指定 article_type の承認済みコメント数を slug ごとに集計して返す。
 * 1クエリで全件取得し、クライアント側でカウントする軽量実装。
 */
export async function getCommentCounts(
  articleType: string
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("comments")
    .select("slug")
    .eq("article_type", articleType)
    .eq("is_approved", true);

  if (error || !data) return {};

  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.slug] = (counts[row.slug] ?? 0) + 1;
  }
  return counts;
}
