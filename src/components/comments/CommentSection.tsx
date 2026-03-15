"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui";
import CommentForm from "./CommentForm";
import CommentSortTabs, { type SortKey } from "./CommentSortTabs";
import CommentItem from "./CommentItem";
import type { ArticleType } from "@/lib/comments/actions";
import type { CommentItem as CommentItemType } from "@/app/api/comments/route";

type Props = {
  slug: string;
  articleType: ArticleType;
};

export default function CommentSection({ slug, articleType }: Props) {
  const [comments, setComments] = useState<CommentItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("newest");

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/comments?slug=${encodeURIComponent(slug)}&type=${articleType}&sort=${sort}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setComments(data.comments ?? []);
    } catch {
      // ネットワークエラーは静かに無視
    } finally {
      setLoading(false);
    }
  }, [slug, articleType, sort]);

  useEffect(() => {
    setLoading(true);
    fetchComments();
  }, [fetchComments]);

  return (
    <Card>
      <h2 className="mb-5 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        コメント
        {!loading && comments.length > 0 && (
          <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">
            ({comments.length}件)
          </span>
        )}
      </h2>

      {/* 投稿フォーム */}
      <div className="mb-6">
        <CommentForm
          slug={slug}
          articleType={articleType}
          onPosted={fetchComments}
        />
      </div>

      {/* コメント一覧 */}
      <div className="border-t border-zinc-100 pt-5 dark:border-zinc-800">
        {loading ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            読み込み中...
          </p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            まだコメントはありません。最初のコメントを投稿してみてください。
          </p>
        ) : (
          <>
            <div className="mb-4">
              <CommentSortTabs sort={sort} onChange={setSort} />
            </div>
            <ul className="space-y-5">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </ul>
          </>
        )}
      </div>
    </Card>
  );
}
