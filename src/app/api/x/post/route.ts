import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TwitterApi } from "twitter-api-v2";
import { createAdminClient } from "@/lib/supabase-admin";
import { twitterCharCount } from "@/lib/x-utils";

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { slug: string; text: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { slug, text } = body;
  if (!slug?.trim() || !text?.trim()) {
    return NextResponse.json({ error: "slug と text が必要です。" }, { status: 400 });
  }

  const charCount = twitterCharCount(text);
  if (charCount > 280) {
    return NextResponse.json(
      { error: `文字数オーバーです（${charCount}/280）。投稿文を短くしてください。` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // 二重投稿チェック
  const { data: existing } = await supabase
    .from("x_posts")
    .select("x_post_id, x_posted_at")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        error: `この記事はすでに投稿済みです（${new Date(existing.x_posted_at as string).toLocaleString("ja-JP")}）。`,
        postId: existing.x_post_id,
      },
      { status: 409 }
    );
  }

  // X API クライアント初期化
  const xClient = new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
    accessToken: process.env.X_ACCESS_TOKEN!,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
  });

  let postId: string;
  try {
    const { data } = await xClient.v2.tweet(text);
    postId = data.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/x/post] X API error:", msg);
    return NextResponse.json({ error: `X投稿エラー: ${msg}` }, { status: 500 });
  }

  // 投稿記録を Supabase に保存
  const { error: saveError } = await supabase.from("x_posts").insert({
    slug,
    x_post_id: postId,
    tweet_text: text,
  });
  if (saveError) {
    console.error("[api/x/post] save error:", saveError.message);
  }

  return NextResponse.json({ ok: true, postId });
}
