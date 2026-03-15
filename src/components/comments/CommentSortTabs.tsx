"use client";

export type SortKey = "newest" | "oldest" | "top";

const TABS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "新しい順" },
  { key: "oldest", label: "古い順" },
  { key: "top", label: "評価順" },
];

type Props = {
  sort: SortKey;
  onChange: (sort: SortKey) => void;
};

export default function CommentSortTabs({ sort, onChange }: Props) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            sort === tab.key
              ? "bg-violet-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
