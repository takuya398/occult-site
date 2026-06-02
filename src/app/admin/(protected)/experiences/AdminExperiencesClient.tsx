"use client";

import { useState } from "react";
import Link from "next/link";
import { formatBoardDate, formatStoryNo } from "@/lib/experiences/format";
import { buildExperienceUrl } from "@/lib/experiences/slugify";
import type { Experience, ExperienceStatus } from "@/lib/experiences/types";

const STATUS_LABELS: Record<ExperienceStatus, string> = {
  pending: "審査中",
  published: "公開",
  rejected: "却下",
  hidden: "非公開",
  deleted: "削除済",
};
const STATUS_COLORS: Record<ExperienceStatus, string> = {
  pending: "bg-yellow-900/40 text-yellow-300",
  published: "bg-green-900/40 text-green-300",
  rejected: "bg-zinc-800 text-zinc-400",
  hidden: "bg-orange-900/40 text-orange-300",
  deleted: "bg-red-900/40 text-red-300",
};

type Props = { experiences: Experience[] };

export default function AdminExperiencesClient({ experiences: initial }: Props) {
  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  async function changeStatus(id: string, status: ExperienceStatus) {
    setLoading(id + status);
    const res = await fetch("/api/admin/experiences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e))
      );
    }
    setLoading(null);
  }

  const filtered = filterStatus === "all" ? items : items.filter((e) => e.status === filterStatus);
  const pendingCount = items.filter((e) => e.status === "pending").length;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        {[
          ["all", `全て (${items.length})`],
          ["pending", `審査中 (${pendingCount})`],
          ["published", "公開"],
          ["hidden", "非公開"],
          ["rejected", "却下"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`rounded-full px-3 py-1 ${filterStatus === key ? "bg-violet-700 text-white" : "border border-zinc-700 text-zinc-400"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs text-zinc-500">
              <th className="py-2 text-left">No.</th>
              <th className="py-2 text-left">タイトル</th>
              <th className="py-2 text-left">投稿者</th>
              <th className="py-2 text-left">都道府県</th>
              <th className="py-2 text-left">怖さ</th>
              <th className="py-2 text-left">ステータス</th>
              <th className="py-2 text-left">投稿日</th>
              <th className="py-2 text-left">👻</th>
              <th className="py-2 text-left">💬</th>
              <th className="py-2 text-left">🚨</th>
              <th className="py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className={`border-b border-zinc-900 ${e.report_count >= 3 ? "bg-red-950/20" : ""}`}>
                <td className="py-2 font-mono text-xs text-zinc-500">{formatStoryNo(e.story_no)}</td>
                <td className="py-2 max-w-[200px]">
                  <Link
                    href={buildExperienceUrl(e.story_no, e.slug)}
                    target="_blank"
                    className="line-clamp-1 text-violet-400 hover:underline"
                  >
                    {e.title}
                  </Link>
                </td>
                <td className="py-2 text-xs text-zinc-400">{e.display_name}</td>
                <td className="py-2 text-xs text-zinc-400">{e.prefecture}</td>
                <td className="py-2 text-xs text-amber-400">{"★".repeat(e.scare_level)}</td>
                <td className="py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLORS[e.status]}`}>
                    {STATUS_LABELS[e.status]}
                  </span>
                </td>
                <td className="py-2 text-xs text-zinc-500">{formatBoardDate(e.created_at)}</td>
                <td className="py-2 text-xs text-zinc-400">{e.like_count}</td>
                <td className="py-2 text-xs text-zinc-400">{e.comment_count}</td>
                <td className={`py-2 text-xs font-bold ${e.report_count >= 3 ? "text-red-400" : "text-zinc-500"}`}>
                  {e.report_count}
                </td>
                <td className="py-2">
                  <div className="flex gap-1">
                    {e.status !== "published" && (
                      <button
                        onClick={() => changeStatus(e.id, "published")}
                        disabled={loading !== null}
                        className="rounded bg-green-800 px-2 py-0.5 text-xs text-green-200 hover:bg-green-700 disabled:opacity-50"
                      >
                        公開
                      </button>
                    )}
                    {e.status === "published" && (
                      <button
                        onClick={() => changeStatus(e.id, "hidden")}
                        disabled={loading !== null}
                        className="rounded bg-orange-900 px-2 py-0.5 text-xs text-orange-200 hover:bg-orange-800 disabled:opacity-50"
                      >
                        非公開
                      </button>
                    )}
                    {e.status === "pending" && (
                      <button
                        onClick={() => changeStatus(e.id, "rejected")}
                        disabled={loading !== null}
                        className="rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300 hover:bg-zinc-600 disabled:opacity-50"
                      >
                        却下
                      </button>
                    )}
                    {e.status !== "deleted" && (
                      <button
                        onClick={() => { if (confirm("削除しますか？")) changeStatus(e.id, "deleted"); }}
                        disabled={loading !== null}
                        className="rounded bg-red-900 px-2 py-0.5 text-xs text-red-200 hover:bg-red-800 disabled:opacity-50"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-500">該当する投稿はありません。</p>
        )}
      </div>
    </>
  );
}
