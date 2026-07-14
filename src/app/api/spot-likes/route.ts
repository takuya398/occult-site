import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { hashIp } from "@/lib/experiences/rateLimit";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug が必要です。" }, { status: 400 });
  }

  const { count, error } = await supabase
    .from("spot_likes")
    .select("*", { count: "exact", head: true })
    .eq("slug", slug);

  if (error) {
    console.error("[spot-likes] select error:", error.message);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ count: count ?? 0 });
}

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIp(ip);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim();
  const guestKey = String(body.guest_key ?? "").trim() || null;

  if (!slug) {
    return NextResponse.json({ error: "slug が必要です。" }, { status: 400 });
  }
  if (!guestKey) {
    return NextResponse.json(
      { error: "guest_key が必要です。" },
      { status: 400 }
    );
  }

  const { error: insertError } = await supabase.from("spot_likes").insert({
    slug,
    guest_key: guestKey,
    ip_hash: ipHash,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      const { count } = await supabase
        .from("spot_likes")
        .select("*", { count: "exact", head: true })
        .eq("slug", slug);
      return NextResponse.json({
        ok: false,
        duplicate: true,
        count: count ?? 0,
      });
    }
    console.error("[spot-likes] insert error:", insertError.message);
    return NextResponse.json({ error: "失敗しました。" }, { status: 500 });
  }

  const { count } = await supabase
    .from("spot_likes")
    .select("*", { count: "exact", head: true })
    .eq("slug", slug);

  return NextResponse.json({ ok: true, count: count ?? 1 });
}
