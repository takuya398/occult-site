"use client";

import { useState, useMemo } from "react";
import { twitterCharCount, generateSpotTweet } from "@/lib/x-utils";

type ArticleInfo = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  publishedAt: string;
  posted: { x_post_id: string; x_posted_at: string } | null;
};

type PostStatus = "idle" | "loading" | "success" | "error" | "duplicate";

export default function XPostClient({ articles }: { articles: ArticleInfo[] }) {
  const [selectedSlug, setSelectedSlug] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<PostStatus>("idle");
  const [message, setMessage] = useState("");
  const [resultPostId, setResultPostId] = useState("");

  const selected = useMemo(
    () => articles.find((a) => a.slug === selectedSlug) ?? null,
    [articles, selectedSlug]
  );

  const charCount = useMemo(() => twitterCharCount(text), [text]);
  const isOver = charCount > 280;
  const isNearLimit = charCount > 250 && !isOver;

  function handleSelect(slug: string) {
    setSelectedSlug(slug);
    setStatus("idle");
    setMessage("");
    setResultPostId("");
    const article = articles.find((a) => a.slug === slug);
    if (article) setText(generateSpotTweet(article));
  }

  async function handlePost() {
    if (!selected || !text.trim() || isOver || status === "loading") return;
    setStatus("loading");
    setMessage("");
    setResultPostId("");

    try {
      const res = await fetch("/api/x/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: selected.slug, text }),
      });
      const json = await res.json() as { ok?: boolean; error?: string; postId?: string };

      if (res.status === 409) {
        setStatus("duplicate");
        setMessage(json.error ?? "投稿済みです。");
        if (json.postId) setResultPostId(json.postId);
      } else if (res.ok) {
        setStatus("success");
        setMessage("投稿しました！");
        setResultPostId(json.postId ?? "");
      } else {
        setStatus("error");
        setMessage(json.error ?? "エラーが発生しました。");
      }
    } catch {
      setStatus("error");
      setMessage("ネットワークエラーが発生しました。");
    }
  }

  return (
    <div className="space-y-6">
      {/* 記事セレクター */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-300">
          記事を選択
        </label>
        <select
          value={selectedSlug}
          onChange={(e) => handleSelect(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          <option value="">-- 記事を選択してください --</option>
          {articles.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.posted ? "✓ " : ""}
              {a.title.length > 60 ? a.title.slice(0, 60) + "…" : a.title}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <>
          {/* 投稿済み警告 */}
          {selected.posted && (
            <div className="rounded-lg border border-yellow-700/60 bg-yellow-900/20 px-4 py-3 text-sm text-yellow-300">
              この記事はすでに投稿済みです（
              {new Date(selected.posted.x_posted_at).toLocaleString("ja-JP")}）。
              <a
                href={`https://x.com/i/web/status/${selected.posted.x_post_id}`}
                target="_blank"
                rel="noreferrer"
                className="ml-2 underline hover:text-yellow-200"
              >
                投稿を見る →
              </a>
            </div>
          )}

          {/* 投稿文エディタ */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-semibold text-zinc-300">
                投稿文（編集可）
              </label>
              <span
                className={`font-mono text-sm ${
                  isOver
                    ? "text-red-400"
                    : isNearLimit
                    ? "text-yellow-400"
                    : "text-zinc-400"
                }`}
              >
                {charCount} / 280
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 font-mono text-sm leading-relaxed text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            {isOver && (
              <p className="mt-1 text-sm text-red-400">
                280文字を超えています。テキストを短くしてください。
              </p>
            )}
          </div>

          {/* プレビュー */}
          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-300">プレビュー</p>
            <div className="min-h-[120px] whitespace-pre-wrap rounded-xl border border-zinc-700 bg-zinc-900/50 px-5 py-4 text-sm leading-relaxed text-zinc-200">
              {text || (
                <span className="text-zinc-500">投稿文を入力してください</span>
              )}
            </div>
          </div>

          {/* 投稿ボタン */}
          <button
            onClick={handlePost}
            disabled={status === "loading" || isOver || !text.trim()}
            className="rounded-lg bg-[#1d9bf0] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#1a8cd8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "loading" ? "投稿中…" : "Xに投稿する"}
          </button>

          {/* 結果フィードバック */}
          {status === "success" && (
            <div className="rounded-lg border border-green-700/60 bg-green-900/20 px-4 py-3 text-sm text-green-300">
              {message}
              {resultPostId && (
                <a
                  href={`https://x.com/i/web/status/${resultPostId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 underline hover:text-green-200"
                >
                  投稿を確認する →
                </a>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="rounded-lg border border-red-700/60 bg-red-900/20 px-4 py-3 text-sm text-red-300">
              ⚠ {message}
            </div>
          )}

          {status === "duplicate" && (
            <div className="rounded-lg border border-yellow-700/60 bg-yellow-900/20 px-4 py-3 text-sm text-yellow-300">
              {message}
              {resultPostId && (
                <a
                  href={`https://x.com/i/web/status/${resultPostId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 underline hover:text-yellow-200"
                >
                  既存の投稿を確認する →
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
