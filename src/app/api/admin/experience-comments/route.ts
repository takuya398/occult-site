import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase-admin";
import type { CommentStatus } from "@/lib/experiences/types";

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === process.env.ADMIN_PASSWORD;
}

// コメントステータス変更は必ず DB 関数経由
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const commentId = String(body.comment_id ?? "").trim();
  const status = String(body.status ?? "") as CommentStatus;
  const validStatuses: CommentStatus[] = ["pending", "published", "hidden", "deleted"];

  if (!commentId) return NextResponse.json({ error: "comment_id が必要です。" }, { status: 400 });
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "無効なステータスです。" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.rpc("update_experience_comment_status", {
    p_comment_id: commentId,
    p_new_status: status,
  });

  if (error) {
    console.error("[admin/experience-comments] rpc error:", error.message);
    return NextResponse.json({ error: "更新に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
