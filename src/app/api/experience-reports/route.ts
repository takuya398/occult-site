import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase-admin";
import { REPORT_REASONS } from "@/lib/experiences/types";
import { hashIp, hashUserAgent, checkRateLimit, recordRateLimit } from "@/lib/experiences/rateLimit";

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = headersList.get("user-agent") ?? "";
  const ipHash = hashIp(ip);
  const uaHash = hashUserAgent(ua);

  const allowed = await checkRateLimit("report", ipHash);
  if (!allowed) {
    return NextResponse.json(
      { error: "短時間に多数の通報はできません。" },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const targetType = String(body.target_type ?? "") as "experience" | "comment";
  const targetId = String(body.target_id ?? "").trim();
  const reason = String(body.reason ?? "").trim();
  const detail = String(body.detail ?? "").trim() || null;
  const guestKey = String(body.guest_key ?? "").trim() || null;

  if (!["experience", "comment"].includes(targetType)) {
    return NextResponse.json({ error: "Invalid target_type" }, { status: 400 });
  }
  if (!targetId) return NextResponse.json({ error: "target_id が必要です。" }, { status: 400 });
  if (!REPORT_REASONS.includes(reason as never)) {
    return NextResponse.json({ error: "通報理由を選択してください。" }, { status: 400 });
  }

  const { error: insertError } = await supabase.from("experience_reports").insert({
    target_type: targetType,
    target_id: targetId,
    reason,
    detail,
    guest_key: guestKey,
    ip_hash: ipHash,
    user_agent_hash: uaHash,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({
        ok: true,
        duplicate: true,
        message: "この投稿はすでに通報済みです。運営が内容を確認します。",
      });
    }
    console.error("[experience-reports] insert error:", insertError.message);
    return NextResponse.json({ error: "通報の送信に失敗しました。" }, { status: 500 });
  }

  // report_count を +1（重複通報時は増やさない = insert成功時のみ）
  const adminClient = createAdminClient();
  const table = targetType === "experience" ? "experiences" : "experience_comments";
  const { data: current } = await adminClient
    .from(table)
    .select("report_count")
    .eq("id", targetId)
    .single<{ report_count: number }>();

  await adminClient
    .from(table)
    .update({ report_count: (current?.report_count ?? 0) + 1 })
    .eq("id", targetId);

  await recordRateLimit("report", ipHash, uaHash, guestKey ?? undefined);

  return NextResponse.json({
    ok: true,
    message: "通報を受け付けました。運営が内容を確認します。",
  });
}
