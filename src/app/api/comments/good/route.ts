import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let commentId: string;
  try {
    const body = await req.json();
    commentId = body.commentId;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!commentId) {
    return NextResponse.json({ error: "Missing commentId" }, { status: 400 });
  }

  // 現在の good_count を取得
  const { data: current, error: fetchError } = await supabase
    .from("comments")
    .select("good_count")
    .eq("id", commentId)
    .eq("is_approved", true)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  // +1 して更新
  const { data, error } = await supabase
    .from("comments")
    .update({ good_count: current.good_count + 1 })
    .eq("id", commentId)
    .eq("is_approved", true)
    .select("good_count")
    .single();

  if (error || !data) {
    console.error("[comments/good] update error:", error?.message);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ good_count: data.good_count });
}
