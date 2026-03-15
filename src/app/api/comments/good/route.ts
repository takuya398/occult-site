import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  let commentId: string;
  let userKey: string;
  try {
    const body = await req.json();
    commentId = body.commentId;
    userKey = body.userKey;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!commentId || !userKey) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 承認済みコメントか確認
  const { data: comment, error: commentError } = await supabase
    .from("comments")
    .select("id, good_count")
    .eq("id", commentId)
    .eq("is_approved", true)
    .single();

  if (commentError || !comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  // すでにグッド済みか確認
  const { data: existing } = await supabase
    .from("comment_likes")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_key", userKey)
    .maybeSingle();

  let liked: boolean;
  let newCount: number;

  if (existing) {
    // 取り消し: delete + good_count -1
    await supabase
      .from("comment_likes")
      .delete()
      .eq("comment_id", commentId)
      .eq("user_key", userKey);

    newCount = Math.max(0, comment.good_count - 1);
    liked = false;
  } else {
    // グッド: insert + good_count +1
    const { error: insertError } = await supabase
      .from("comment_likes")
      .insert({ comment_id: commentId, user_key: userKey });

    if (insertError) {
      // unique制約違反 = 同時リクエストで既にinsert済み
      console.error("[good] insert error:", insertError.message);
      return NextResponse.json({ error: "Already liked" }, { status: 409 });
    }

    newCount = comment.good_count + 1;
    liked = true;
  }

  // good_count を更新
  const { data: updated, error: updateError } = await supabase
    .from("comments")
    .update({ good_count: newCount })
    .eq("id", commentId)
    .select("good_count")
    .single();

  if (updateError) {
    console.error("[good] update error:", updateError.message);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ liked, good_count: updated.good_count });
}
