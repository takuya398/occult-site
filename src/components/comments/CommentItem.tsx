"use client";

import { useState, useEffect } from "react";
import type { CommentItem as CommentItemType } from "@/app/api/comments/route";
import { getUserKey, isCommentLiked, setCommentLiked } from "@/lib/userKey";

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
  const [liked, setLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // localStorage はサーバーでは読めないため useEffect で初期化
  useEffect(() => {
    setLiked(isCommentLiked(comment.id));
  }, [comment.id]);

  async function handleGood() {
    if (isLoading) return;
    setIsLoading(true);

    const userKey = getUserKey();
    const nextLiked = !liked;

    // 楽観更新
    setLiked(nextLiked);
    setGoodCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await fetch("/api/comments/good", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: comment.id, userKey }),
      });

      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setGoodCount(data.good_count);
        setCommentLiked(comment.id, data.liked);
      } else {
        // ロールバック
        console.error("[good] API error:", res.status, await res.text());
        setLiked(!nextLiked);
        setGoodCount((prev) => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
      }
    } catch (err) {
      // ロールバック
      console.error("[good] Network error:", err);
      setLiked(!nextLiked);
      setGoodCount((prev) => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
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
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
            liked
              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          }`}
          aria-label={liked ? "グッドを取り消す" : "グッドする"}
        >
          <span>👍</span>
          <span>{goodCount}</span>
          <span>{liked ? "済み" : "する"}</span>
        </button>
      </div>
    </li>
  );
}
