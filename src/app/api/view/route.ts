import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { slug, articleType = "spots" } = await req.json();
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("article_views").insert({
      article_slug: slug,
      article_type: articleType,
    });

    if (error) {
      console.error("[view] supabase error:", error.message);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[view] unexpected error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
