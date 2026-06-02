"use client";

import { useState } from "react";
import { getUserKey } from "@/lib/userKey";
import { REPORT_REASONS } from "@/lib/experiences/types";

type Props = {
  targetType: "experience" | "comment";
  targetId: string;
};

export default function ReportButton({ targetType, targetId }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason || loading) return;
    setLoading(true);

    const res = await fetch("/api/experience-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_type: targetType,
        target_id: targetId,
        reason,
        detail: detail || null,
        guest_key: getUserKey(),
      }),
    });

    const data = await res.json();
    setMessage(data.message ?? (data.error || "エラーが発生しました。"));
    setLoading(false);
    if (data.ok) {
      setTimeout(() => setOpen(false), 2000);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-zinc-400 underline hover:text-zinc-300"
      >
        通報
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-5">
            <h3 className="mb-4 text-sm font-semibold text-zinc-100">通報</h3>
            {message ? (
              <p className="text-sm text-zinc-300">{message}</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
                >
                  <option value="">通報理由を選択</option>
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="補足内容（任意）"
                  rows={3}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!reason || loading}
                    className="flex-1 rounded-lg bg-red-800 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    送信
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
