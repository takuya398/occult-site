import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase-admin";
import type { ExperienceStatus } from "@/lib/experiences/types";

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === process.env.ADMIN_PASSWORD;
}

// 管理操作（ステータス変更）
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

  const id = String(body.id ?? "").trim();
  const status = String(body.status ?? "") as ExperienceStatus;
  const validStatuses: ExperienceStatus[] = ["pending", "published", "rejected", "hidden", "deleted"];

  if (!id) return NextResponse.json({ error: "id が必要です。" }, { status: 400 });
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "無効なステータスです。" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const updateData: Record<string, unknown> = { status };
  if (status === "published") {
    updateData.published_at = new Date().toISOString();
  }

  const { error } = await adminClient
    .from("experiences")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("[admin/experiences] update error:", error.message);
    return NextResponse.json({ error: "更新に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
