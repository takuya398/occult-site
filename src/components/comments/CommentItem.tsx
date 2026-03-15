"use client";

import { useState } from "react";
import type { CommentItem as CommentItemType } from "@/app/api/comments/route";

type Props = {
  comment: CommentItemType;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentItem({ comment }: Props) {
  const [goodCount, setGoodCount] = useState(comment.good_count);
  const [isLoading, setIsLoading] = useState(false);

  async function handleGood() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/comments/good", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: comment.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setGoodCount(data.good_count);
      }
    } catch {
      // ネットワークエラーは静かに無視
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <li>
      <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {comment.author_name}
        </span>
        <time
          dateTime={comment.created_at}
          className="text-xs text-zinc-400 dark:text-zinc-500"
        >
          {formatDate(comment.created_at)}
        </time>
      </div>
      <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
        {comment.body}
      </p>
      <div className="mt-2">
        <button
          onClick={handleGood}
          disabled={isLoading}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label="グッド"
        >
          <span>👍</span>
          <span>{goodCount}</span>
        </button>
      </div>
    </li>
  );
}
