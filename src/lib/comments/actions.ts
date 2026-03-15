"use server";

import { createHash } from "crypto";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { validateComment } from "./validation";

export type ArticleType = "spots" | "uma" | "legends" | "entities";

export type SubmitCommentState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function submitComment(
  slug: string,
  articleType: ArticleType,
  _prevState: SubmitCommentState,
  formData: FormData
): Promise<SubmitCommentState> {
  // Honeypot: ボットはこのフィールドを埋めてしまう
  if (formData.get("website")) {
    return { status: "success" }; // 無言で成功扱い
  }

  const body = (formData.get("body") as string | null) ?? "";
  const rawName = (formData.get("author_name") as string | null) ?? "";
  const authorName = rawName.trim() || "匿名";

  const validation = validateComment(body, rawName);
  if (!validation.ok) {
    return { status: "error", message: validation.message };
  }

  // IPハッシュで連投チェック（60秒以内に3件以上 → NG）
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const salt = process.env.RATE_LIMIT_SALT ?? "default-salt";
  const ipHash = createHash("sha256").update(ip + salt).digest("hex");

  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  if ((count ?? 0) >= 3) {
    return {
      status: "error",
      message:
        "短時間に複数回投稿することはできません。しばらく待ってから再度お試しください。",
    };
  }

  const { error } = await supabase.from("comments").insert({
    slug,
    article_type: articleType,
    author_name: authorName,
    body: body.trim(),
    ip_hash: ipHash,
    is_approved: false,
  });

  if (error) {
    console.error("[comments] insert error:", error.message);
    return {
      status: "error",
      message: "投稿に失敗しました。しばらく待ってから再度お試しください。",
    };
  }

  return { status: "success" };
}
