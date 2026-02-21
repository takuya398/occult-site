import Link from "next/link";
import type { Metadata } from "next";
import { umas } from "@/loaders";
import { UMA_TAG_CATEGORIES } from "@/data/uma-tags";
import { TAG_SLUG_MAP } from "@/data/uma-tag-slugs";

export const metadata: Metadata = {
  title: "タグ一覧 | UMA図鑑",
  description: "UMAをタグ別に探せる一覧ページ。生息環境・形態・特徴・由来・証拠のカテゴリで絞り込めます。",
};

export default function TagsPage() {
  // タグ別UMA件数を集計
  const tagCounts: Record<string, number> = {};
  umas.forEach((uma) => {
    uma.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    });
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="mb-6">
          <Link
            href="/uma"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            ← UMA一覧へ
          </Link>
        </div>

        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">タグ一覧</h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300">
            タグを選んでUMAを絞り込めます。
          </p>
        </header>

        <div className="mt-10 space-y-10">
          {(
            Object.entries(UMA_TAG_CATEGORIES) as [
              keyof typeof UMA_TAG_CATEGORIES,
              (typeof UMA_TAG_CATEGORIES)[keyof typeof UMA_TAG_CATEGORIES],
            ][]
          ).map(([, category]) => (
            <section key={category.label}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {category.label}
              </h2>
              <div className="flex flex-wrap gap-2">
                {category.tags.map((tag) => {
                  const count = tagCounts[tag] ?? 0;
                  const slug = TAG_SLUG_MAP[tag];

                  if (count > 0 && slug) {
                    return (
                      <Link
                        key={tag}
                        href={`/tags/${slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-500"
                      >
                        <span>{tag}</span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          ({count})
                        </span>
                      </Link>
                    );
                  }

                  return (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-600"
                    >
                      <span>{tag}</span>
                      <span className="text-xs">(0)</span>
                    </span>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
