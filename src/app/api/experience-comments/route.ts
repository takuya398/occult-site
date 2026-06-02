import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase-admin";
import { validateCommentBody, validateDisplayName } from "@/lib/experiences/validate";
import { hashIp, hashUserAgent, checkRateLimit, recordRateLimit } from "@/lib/experiences/rateLimit";

export async function GET(req: NextRequest) {
  const experienceId = req.nextUrl.searchParams.get("experience_id");
  const sort = req.nextUrl.searchParams.get("sort") ?? "oldest";

  if (!experienceId) {
    return NextResponse.json({ error: "Missing experience_id" }, { status: 400 });
  }

  let query = supabase
    .from("experience_comments")
    .select("id, comment_no, parent_comment_id, body, display_name, status, like_count, created_at")
    .eq("experience_id", experienceId)
    .in("status", ["published", "hidden", "deleted"]);

  if (sort === "newest") {
    query = query.order("comment_no", { ascending: false });
  } else if (sort === "popular") {
    query = query.order("like_count", { ascending: false }).order("comment_no", { ascending: true });
  } else {
    query = query.order("comment_no", { ascending: true });
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json({ comments: data ?? [] });
}

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = headersList.get("user-agent") ?? "";
  const ipHash = hashIp(ip);
  const uaHash = hashUserAgent(ua);

  const allowed = await checkRateLimit("comment", ipHash);
  if (!allowed) {
    return NextResponse.json(
      { error: "短時間に多くのコメントを投稿することはできません。" },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.website) return NextResponse.json({ ok: true });

  const experienceId = String(body.experience_id ?? "").trim();
  const commentBody = String(body.body ?? "").trim();
  const displayName = String(body.display_name ?? "").trim() || "名無し";
  const parentCommentId = String(body.parent_comment_id ?? "").trim() || null;
  const guestKey = String(body.guest_key ?? "").trim() || null;

  if (!experienceId) return NextResponse.json({ error: "experience_id が必要です。" }, { status: 400 });

  const bodyResult = validateCommentBody(commentBody);
  if (!bodyResult.ok) return NextResponse.json({ error: bodyResult.message }, { status: 400 });

  const nameResult = validateDisplayName(displayName);
  if (!nameResult.ok) return NextResponse.json({ error: nameResult.message }, { status: 400 });

  // 体験談が published か確認
  const { data: exp } = await supabase
    .from("experiences")
    .select("id")
    .eq("id", experienceId)
    .eq("status", "published")
    .single();

  if (!exp) {
    return NextResponse.json({ error: "投稿先が見つかりません。" }, { status: 404 });
  }

  const commentStatus = bodyResult.status;

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.rpc("create_experience_comment", {
    p_experience_id: experienceId,
    p_body: commentBody,
    p_display_name: displayName,
    p_parent_comment_id: parentCommentId,
    p_status: commentStatus,
    p_ip_hash: ipHash,
    p_user_agent_hash: uaHash,
  });

  if (error) {
    console.error("[experience-comments] rpc error:", error.message);
    return NextResponse.json({ error: "コメントの投稿に失敗しました。" }, { status: 500 });
  }

  await recordRateLimit("comment", ipHash, uaHash, guestKey ?? undefined);

  return NextResponse.json({ ok: true, comment: data });
}
