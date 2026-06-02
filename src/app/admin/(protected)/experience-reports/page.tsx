import { createAdminClient } from "@/lib/supabase-admin";
import { formatBoardDate } from "@/lib/experiences/format";
import type { ExperienceReport } from "@/lib/experiences/types";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminExperienceReportsPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("experience_reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500">取得エラー: {error.message}</div>;
  }

  const reports = (data ?? []) as ExperienceReport[];

  const STATUS_LABEL: Record<string, string> = {
    open: "未対応",
    reviewing: "確認中",
    resolved: "対応済",
    rejected: "却下",
  };
  const STATUS_COLOR: Record<string, string> = {
    open: "text-red-400",
    reviewing: "text-yellow-400",
    resolved: "text-green-400",
    rejected: "text-zinc-500",
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-bold">通報管理</h1>
        <p className="mb-4 text-sm text-zinc-400">{reports.length} 件</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                <th className="py-2 text-left">対象</th>
                <th className="py-2 text-left">対象ID</th>
                <th className="py-2 text-left">理由</th>
                <th className="py-2 text-left">補足</th>
                <th className="py-2 text-left">通報日時</th>
                <th className="py-2 text-left">対応状況</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-zinc-900">
                  <td className="py-2 text-xs text-zinc-400">{r.target_type}</td>
                  <td className="py-2 font-mono text-xs text-zinc-500">{r.target_id.slice(0, 8)}…</td>
                  <td className="py-2 text-xs text-zinc-300">{r.reason}</td>
                  <td className="py-2 max-w-[200px] text-xs text-zinc-400 line-clamp-1">{r.detail ?? "-"}</td>
                  <td className="py-2 text-xs text-zinc-500">{formatBoardDate(r.created_at)}</td>
                  <td className={`py-2 text-xs font-semibold ${STATUS_COLOR[r.status]}`}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500">通報はありません。</p>
          )}
        </div>
      </div>
    </div>
  );
}
