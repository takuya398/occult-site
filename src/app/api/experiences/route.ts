import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase-admin";
import { validateExperienceTitle, validateExperienceBody, validateDisplayName } from "@/lib/experiences/validate";
import { generateExperienceSlug } from "@/lib/experiences/slugify";
import { hashIp, hashUserAgent, checkRateLimit, recordRateLimit } from "@/lib/experiences/rateLimit";
import { getSpotEntriesFromArticles } from "@/lib/spot-articles";

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = headersList.get("user-agent") ?? "";
  const ipHash = hashIp(ip);
  const uaHash = hashUserAgent(ua);

  // レート制限チェック
  const allowed = await checkRateLimit("experience", ipHash);
  if (!allowed) {
    return NextResponse.json(
      { error: "短時間に複数回投稿することはできません。しばらく待ってから再度お試しください。" },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const title = String(body.title ?? "").trim();
  const bodyText = String(body.body ?? "").trim();
  const displayName = String(body.display_name ?? "").trim() || "名無しの体験者";
  const prefecture = String(body.prefecture ?? "").trim();
  const placeName = String(body.place_name ?? "").trim() || null;
  const genre = String(body.genre ?? "").trim();
  const scareLevel = Number(body.scare_level);
  const rawSpotSlug = String(body.related_spot_slug ?? "").trim() || null;
  const guestKey = String(body.guest_key ?? "").trim() || null;

  // バリデーション
  const titleResult = validateExperienceTitle(title);
  if (!titleResult.ok) return NextResponse.json({ error: titleResult.message }, { status: 400 });

  const bodyResult = validateExperienceBody(bodyText);
  if (!bodyResult.ok) return NextResponse.json({ error: bodyResult.message }, { status: 400 });

  const nameResult = validateDisplayName(displayName);
  if (!nameResult.ok) return NextResponse.json({ error: nameResult.message }, { status: 400 });

  if (!prefecture) return NextResponse.json({ error: "都道府県を選択してください。" }, { status: 400 });
  if (!genre) return NextResponse.json({ error: "体験ジャンルを選択してください。" }, { status: 400 });
  if (scareLevel < 1 || scareLevel > 5 || isNaN(scareLevel)) {
    return NextResponse.json({ error: "怖さレベルを選択してください。" }, { status: 400 });
  }

  // related_spot_slug のバリデーション
  let relatedSpotSlug: string | null = null;
  if (rawSpotSlug) {
    const spots = await getSpotEntriesFromArticles();
    const exists = spots.some((s) => s.slug === rawSpotSlug);
    relatedSpotSlug = exists ? rawSpotSlug : null;
  }

  // 投稿ステータス決定（bodyResult.status で pending/published が決まる）
  const status = "pending"; // 必ず pending から → 管理者承認で published

  const adminClient = createAdminClient();

  // story_no は DB の bigserial で自動採番されるが slug 生成に必要なので仮値でinsert後に取得
  const { data: inserted, error: insertError } = await adminClient
    .from("experiences")
    .insert({
      slug: "temp",
      title,
      body: bodyText,
      display_name: displayName,
      prefecture,
      place_name: placeName,
      genre,
      scare_level: scareLevel,
      related_spot_slug: relatedSpotSlug,
      status,
      ip_hash: ipHash,
      user_agent_hash: uaHash,
    })
    .select("id, story_no")
    .single();

  if (insertError || !inserted) {
    console.error("[experiences] insert error:", insertError?.message);
    return NextResponse.json({ error: "投稿に失敗しました。" }, { status: 500 });
  }

  const slug = generateExperienceSlug(title, placeName ?? null, inserted.story_no);
  await adminClient.from("experiences").update({ slug }).eq("id", inserted.id);

  // レート制限記録
  await recordRateLimit("experience", ipHash, uaHash, guestKey ?? undefined);

  return NextResponse.json({ ok: true, story_no: inserted.story_no, slug });
}
