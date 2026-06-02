"use client";

import { useState, useEffect, useCallback } from "react";
import { getUserKey } from "@/lib/userKey";
import { formatBoardDate } from "@/lib/experiences/format";
import LikeButton from "./LikeButton";
import ReportButton from "./ReportButton";

type Comment = {
  id: string;
  comment_no: number;
  parent_comment_id: string | null;
  body: string;
  display_name: string;
  status: string;
  like_count: number;
  created_at: string;
};

type Props = { experienceId: string };

export default function ExperienceComments({ experienceId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [sort, setSort] = useState("oldest");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [replyTo, setReplyTo] = useState<{ no: number; id: string } | null>(null);
  const [message, setMessage] = useState("");

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/experience-comments?experience_id=${experienceId}&sort=${sort}`);
    const data = await res.json();
    setComments(data.comments ?? []);
    setLoading(false);
  }, [experienceId, sort]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    setMessage("");

    const guestKey = getUserKey();
    const bodyText = replyTo ? `>>${replyTo.no}\n${body}` : body;

    const res = await fetch("/api/experience-comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        experience_id: experienceId,
        body: bodyText,
        display_name: name.trim() || "名無し",
        parent_comment_id: replyTo?.id ?? null,
        guest_key: guestKey,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      setBody("");
      setName("");
      setReplyTo(null);
      fetchComments();
      setMessage("コメントを投稿しました。");
    } else {
      setMessage(data.error ?? "投稿に失敗しました。");
    }
    setSubmitting(false);
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-base font-semibold text-zinc-100">コメント（{comments.length}件）</h2>

      {/* 並び替え */}
      <div className="mb-4 flex gap-2 text-xs">
        {[["oldest", "古い順"], ["newest", "新しい順"], ["popular", "評価順"]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`rounded px-2 py-1 ${sort === key ? "bg-zinc-700 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* コメント一覧 */}
      <div className="mb-6 space-y-3">
        {loading ? (
          <p className="text-sm text-zinc-500">読み込み中...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-zinc-500">まだコメントはありません。</p>
        ) : (
          comments.map((c) => {
            if (c.status === "deleted") {
              return (
                <p key={c.id} className="text-xs text-zinc-500">
                  No.{c.comment_no}：このコメントは削除されました。
                </p>
              );
            }
            if (c.status === "hidden") {
              return (
                <p key={c.id} className="text-xs text-zinc-500">
                  No.{c.comment_no}：このコメントは運営により非表示になりました。
                </p>
              );
            }
            return (
              <div key={c.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                <p className="mb-1 font-mono text-xs text-zinc-500">
                  No.{c.comment_no}：
                  <span className="text-green-400">{c.display_name}</span>
                  ：{formatBoardDate(c.created_at)}
                </p>
                <p className="mb-2 whitespace-pre-wrap text-sm text-zinc-200">{c.body}</p>
                <div className="flex items-center gap-3">
                  <LikeButton
                    targetType="comment"
                    targetId={c.id}
                    initialCount={c.like_count}
                    storageKey={`c-${c.id}`}
                  />
                  <button
                    onClick={() => setReplyTo({ no: c.comment_no, id: c.id })}
                    className="text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    返信
                  </button>
                  <ReportButton targetType="comment" targetId={c.id} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* コメント投稿フォーム */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4 space-y-3">
        <p className="text-xs font-semibold text-zinc-400">コメントを投稿</p>
        {replyTo && (
          <div className="flex items-center gap-2 rounded bg-zinc-700/50 px-2 py-1 text-xs text-zinc-300">
            <span>&gt;&gt;{replyTo.no} に返信</span>
            <button type="button" onClick={() => setReplyTo(null)} className="ml-auto text-zinc-400 hover:text-zinc-200">✕</button>
          </div>
        )}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前（省略で名無し）"
          maxLength={24}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="コメントを入力（10〜1000文字）"
          rows={4}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
        />
        {message && (
          <p className={`text-xs ${message.includes("投稿しました") ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
        {/* Honeypot */}
        <input name="website" type="text" className="hidden" tabIndex={-1} autoComplete="off" />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-50"
        >
          {submitting ? "投稿中..." : "コメントする"}
        </button>
      </form>
    </section>
  );
}
