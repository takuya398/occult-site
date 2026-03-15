"use client";

import { useActionState, useRef, useEffect } from "react";
import { submitComment } from "@/lib/comments/actions";
import type { ArticleType, SubmitCommentState } from "@/lib/comments/actions";

type Props = {
  slug: string;
  articleType: ArticleType;
  onPosted?: () => void;
};

const initialState: SubmitCommentState = { status: "idle" };

export default function CommentForm({ slug, articleType, onPosted }: Props) {
  const action = submitComment.bind(null, slug, articleType);
  const [state, formAction, isPending] = useActionState<
    SubmitCommentState,
    FormData
  >(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // 投稿成功時: フォームリセット + 一覧再取得を親に通知
  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      onPosted?.();
    }
  }, [state.status, onPosted]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {/* Honeypot: ボット対策（CSSで非表示） */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
        autoComplete="off"
      />

      <div>
        <label
          htmlFor="comment-author"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          名前（任意）
        </label>
        <input
          id="comment-author"
          name="author_name"
          type="text"
          maxLength={50}
          placeholder="匿名"
          disabled={isPending}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
      </div>

      <div>
        <label
          htmlFor="comment-body"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          コメント <span className="text-zinc-400 text-xs font-normal">（必須・1000文字以内）</span>
        </label>
        <textarea
          id="comment-body"
          name="body"
          required
          rows={4}
          maxLength={1000}
          placeholder="コメントを入力してください"
          disabled={isPending}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
      </div>

      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
        >
          {state.message}
        </p>
      )}

      {state.status === "success" && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
        >
          コメントを受け付けました。確認後に公開されます。
        </p>
      )}

      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        ※ 個人情報・誹謗中傷・URLを含む投稿はお控えください。コメントは管理者による確認後に公開されます。
      </p>

      <button
        type="submit"
        disabled={isPending || state.status === "success"}
        className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "送信中..." : "コメントを投稿"}
      </button>
    </form>
  );
}
