import Link from "next/link";
import type { Period, RankingCategory } from "@/lib/ranking/getRankingItems";

const TABS: { key: Period; label: string }[] = [
  { key: "weekly", label: "週間" },
  { key: "monthly", label: "月間" },
  { key: "yearly", label: "年間" },
];

type Props = {
  period: Period;
  category: RankingCategory;
};

export default function RankingTabs({ period, category }: Props) {
  return (
    <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800/60">
      {TABS.map((tab) => {
        const active = tab.key === period;
        return (
          <Link
            key={tab.key}
            href={`/ranking?period=${tab.key}&category=${category}`}
            className={`flex-1 rounded-md px-4 py-2 text-center text-sm font-semibold transition-colors ${
              active
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
