"use client";

import { useState } from "react";
import RecentCard, { type RecentItem } from "@/components/RecentCard";
import { Card } from "@/components/ui";

const PAGE_SIZE = 6;

type RecentListProps = {
  items: RecentItem[];
};

export default function RecentList({ items }: RecentListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (items.length === 0) {
    return (
      <Card className="rounded-lg p-4 text-sm text-zinc-600 dark:text-zinc-300">
        新着は準備中です
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4">
        {items.slice(0, visibleCount).map((item) => (
          <RecentCard key={item.href} item={item} />
        ))}
      </div>
      {visibleCount < items.length && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            もっと表示する
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
