import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export type CommentItem = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
  good_count: number;
};

type SortKey = "newest" | "oldest" | "top";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const articleType = req.nextUrl.searchParams.get("type");
  const sort = (req.nextUrl.searchParams.get("sort") ?? "newest") as SortKey;

  if (!slug || !articleType) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  let query = supabase
    .from("comments")
    .select("id, author_name, body, created_at, good_count")
    .eq("slug", slug)
    .eq("article_type", articleType)
    .eq("is_approved", true);

  if (sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (sort === "top") {
    query = query
      .order("good_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    // newest (default)
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("[comments] fetch error:", error.message);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json(
    { comments: data ?? [] },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
