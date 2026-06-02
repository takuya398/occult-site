import { createAdminClient } from "@/lib/supabase-admin";
import AdminExperiencesClient from "./AdminExperiencesClient";
import type { Experience } from "@/lib/experiences/types";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminExperiencesPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen p-8 text-red-500">
        取得エラー: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-bold">心霊体験談 管理</h1>
        <AdminExperiencesClient experiences={(data ?? []) as Experience[]} />
      </div>
    </div>
  );
}
