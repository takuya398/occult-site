"use client";
import { useState } from "react";
import Link from "next/link";
import ArticleImage from "@/components/ArticleImage";

type ArticleCard = {
  title: string;
  slug: string;
  href: string;
  cover?: string;
  category: string;
};

type GroupedArticles = {
  all: ArticleCard[];
  spots: ArticleCard[];
  stories: ArticleCard[];
  entities: ArticleCard[];
  mysteries: ArticleCard[];
};

type TabKey = keyof GroupedArticles;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "spots", label: "心霊スポット" },
  { key: "stories", label: "怪談・都市伝説" },
  { key: "entities", label: "UMA・異形" },
  { key: "mysteries", label: "怪事件・ミステリー" },
];

const CATEGORY_LABEL: Record<string, string> = {
  spots: "心霊スポット",
  legends: "怪談・都市伝説",
  stories: "怪談・都市伝説",
  uma: "UMA",
  entities: "UMA・異形",
  mysteries: "怪事件",
};

type Props = { grouped: GroupedArticles };

export default function ArticleGridWithFilter({ grouped }: Props) {
  const [active, setActive] = useState<TabKey>("all");
  const articles = grouped[active];

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
        新着記事
      </h2>
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              active === tab.key
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {articles.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">記事がありません</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {articles.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 hover:-translate-y-0.5 transition-transform"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                {item.cover ? (
                  <ArticleImage
                    src={item.cover}
                    alt={item.title}
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl opacity-20 select-none">
                    👻
                  </div>
                )}
              </div>
              <div className="p-3 flex flex-col gap-1">
                <span className="text-[10px] font-medium text-zinc-400">
                  {CATEGORY_LABEL[item.category] ?? item.category}
                </span>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
