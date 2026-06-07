"use client";

import { useState, useMemo } from "react";
import { twitterCharCount, generateSpotTweet } from "@/lib/x-utils";

type ArticleInfo = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  publishedAt: string;
};

export default function XPostClient({ articles }: { articles: ArticleInfo[] }) {
  const [selectedSlug, setSelectedSlug] = useState("");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const selected = useMemo(
    () => articles.find((a) => a.slug === selectedSlug) ?? null,
    [articles, selectedSlug]
  );

  const charCount = useMemo(() => twitterCharCount(text), [text]);
  const isOver = charCount > 280;
  const isNearLimit = charCount > 250 && !isOver;

  function handleSelect(slug: string) {
    setSelectedSlug(slug);
    setCopied(false);
    const article = articles.find((a) => a.slug === slug);
    if (article) setText(generateSpotTweet(article));
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleOpenX() {
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
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
              {a.title.length > 60 ? a.title.slice(0, 60) + "…" : a.title}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <>
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

          {/* アクションボタン */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              disabled={!text.trim()}
              className="rounded-lg border border-zinc-600 bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? "コピーしました ✓" : "テキストをコピー"}
            </button>
            <button
              onClick={handleOpenX}
              disabled={!text.trim() || isOver}
              className="rounded-lg bg-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              𝕏 で開く
            </button>
          </div>
        </>
      )}
    </div>
  );
}
