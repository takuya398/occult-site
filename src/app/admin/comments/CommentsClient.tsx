"use client";

import { useState, useTransition } from "react";
import { approveComment, deleteComment } from "./actions";

export type AdminComment = {
  id: string;
  author_name: string;
  body: string;
  article_type: string;
  slug: string;
  created_at: string;
  is_approved: boolean;
  good_count: number;
};

const ARTICLE_TYPE_LABEL: Record<string, string> = {
  spots: "心霊スポット",
  uma: "UMA",
  legends: "伝説",
  entities: "妖怪・エンティティ",
};

function articleUrl(articleType: string, slug: string): string {
  return `/${articleType}/${slug}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentsClient({
  comments,
}: {
  comments: AdminComment[];
}) {
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [isPending, startTransition] = useTransition();

  const filtered = comments.filter((c) =>
    tab === "pending" ? !c.is_approved : c.is_approved
  );

  function handleApprove(id: string) {
    startTransition(async () => {
      await approveComment(id);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("このコメントを削除しますか？\nこの操作は元に戻せません。")) {
      return;
    }
    startTransition(async () => {
      await deleteComment(id);
    });
  }

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {/* タブ */}
      <div className="flex gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-700">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "pending"
              ? "border-violet-500 text-violet-700 dark:text-violet-300"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          未承認
          <span className="ml-2 rounded-full bg-amber-100 text-amber-700 text-xs px-2 py-0.5 dark:bg-amber-900/40 dark:text-amber-300">
            {comments.filter((c) => !c.is_approved).length}
          </span>
        </button>
        <button
          onClick={() => setTab("approved")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "approved"
              ? "border-violet-500 text-violet-700 dark:text-violet-300"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          承認済み
          <span className="ml-2 rounded-full bg-zinc-100 text-zinc-600 text-xs px-2 py-0.5 dark:bg-zinc-700 dark:text-zinc-300">
            {comments.filter((c) => c.is_approved).length}
          </span>
        </button>
      </div>

      {/* コメント一覧 */}
      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500 py-8 text-center">
          {tab === "pending" ? "未承認のコメントはありません" : "承認済みのコメントはありません"}
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
            >
              {/* ヘッダー行 */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {comment.author_name}
                </span>
                <span className="text-xs text-zinc-400">
                  {formatDate(comment.created_at)}
                </span>
                <a
                  href={articleUrl(comment.article_type, comment.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-xs text-violet-600 hover:underline dark:text-violet-400"
                >
                  {ARTICLE_TYPE_LABEL[comment.article_type] ?? comment.article_type}
                  {" / "}
                  {comment.slug}
                  {" ↗"}
                </a>
              </div>

              {/* 本文 */}
              <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 rounded p-3">
                {comment.body}
              </p>

              {/* グッド数 */}
              {comment.is_approved && (
                <div className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                  👍 {comment.good_count}
                </div>
              )}

              {/* ボタン */}
              <div className="flex gap-2 mt-3 justify-end">
                {!comment.is_approved && (
                  <button
                    onClick={() => handleApprove(comment.id)}
                    className="rounded px-3 py-1.5 text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    承認
                  </button>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="rounded px-3 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
