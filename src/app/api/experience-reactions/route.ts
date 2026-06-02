import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase-admin";
import { hashIp, hashUserAgent } from "@/lib/experiences/rateLimit";

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = headersList.get("user-agent") ?? "";
  const ipHash = hashIp(ip);
  const uaHash = hashUserAgent(ua);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const targetType = String(body.target_type ?? "") as "experience" | "comment";
  const targetId = String(body.target_id ?? "").trim();
  const guestKey = String(body.guest_key ?? "").trim() || null;

  if (!["experience", "comment"].includes(targetType)) {
    return NextResponse.json({ error: "Invalid target_type" }, { status: 400 });
  }
  if (!targetId) {
    return NextResponse.json({ error: "target_id が必要です。" }, { status: 400 });
  }
  if (!guestKey) {
    return NextResponse.json({ error: "guest_key が必要です。" }, { status: 400 });
  }

  // 重複チェック: unique index に違反したら重複いいね扱い
  const { error: insertError } = await supabase.from("experience_reactions").insert({
    target_type: targetType,
    target_id: targetId,
    reaction_type: "scary",
    guest_key: guestKey,
    ip_hash: ipHash,
    user_agent_hash: uaHash,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({
        ok: false,
        duplicate: true,
        message: "すでに「怖かった」を押しています。",
      });
    }
    console.error("[experience-reactions] insert error:", insertError.message);
    return NextResponse.json({ error: "失敗しました。" }, { status: 500 });
  }

  // like_count を atomic に +1（admin client で RLS スキップ）
  const adminClient = createAdminClient();
  const table = targetType === "experience" ? "experiences" : "experience_comments";

  const { data: current } = await adminClient
    .from(table)
    .select("like_count")
    .eq("id", targetId)
    .single<{ like_count: number }>();

  const newCount = (current?.like_count ?? 0) + 1;

  await adminClient
    .from(table)
    .update({ like_count: newCount })
    .eq("id", targetId);

  return NextResponse.json({ ok: true, like_count: newCount });
}
