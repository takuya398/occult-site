import Link from "next/link";
import type { Period, RankingCategory } from "@/lib/ranking/getRankingItems";

const TABS: { key: RankingCategory; label: string }[] = [
  { key: "all", label: "総合" },
  { key: "spots", label: "心霊スポット" },
  { key: "legends", label: "都市伝説" },
  { key: "entities", label: "UMA・怪異" },
  { key: "mysteries", label: "怪事件・ミステリー" },
];

type Props = {
  period: Period;
  category: RankingCategory;
};

export default function RankingCategoryTabs({ period, category }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const active = tab.key === category;
        return (
          <Link
            key={tab.key}
            href={`/ranking?period=${period}&category=${tab.key}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
