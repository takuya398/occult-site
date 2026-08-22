"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Period = "weekly" | "monthly" | "yearly";

export type SidebarRankingItem = {
  title: string;
  href: string;
  cover?: string;
};

type Props = {
  weekly: SidebarRankingItem[];
  monthly: SidebarRankingItem[];
  yearly: SidebarRankingItem[];
};

const TABS: { key: Period; label: string }[] = [
  { key: "weekly", label: "週間" },
  { key: "monthly", label: "月間" },
  { key: "yearly", label: "年間" },
];

const RANK_BADGE: { bg: string; text: string }[] = [
  { bg: "bg-yellow-400", text: "text-yellow-900" },
  { bg: "bg-zinc-400 dark:bg-zinc-500", text: "text-white" },
  { bg: "bg-orange-400", text: "text-orange-900" },
];

export default function SidebarRankingWidget({ weekly, monthly, yearly }: Props) {
  const [period, setPeriod] = useState<Period>("weekly");

  const items =
    period === "weekly" ? weekly : period === "monthly" ? monthly : yearly;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="border-b border-zinc-100 px-4 pb-3 pt-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            人気記事ランキング
          </h2>
          <Link
            href="/ranking"
            className="text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            もっと見る →
          </Link>
        </div>

        {/* Period tabs */}
        <div className="mt-3 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className={`flex-1 rounded py-1 text-xs font-semibold transition-colors ${
                period === tab.key
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-zinc-400 dark:text-zinc-600">
          まだデータがありません
        </div>
      ) : (
        <ol>
          {items.map((item, i) => {
            const rank = i + 1;
            const isTop3 = rank <= 3;
            const badge = rank <= 3 ? RANK_BADGE[rank - 1] : null;

            return (
              <li
                key={`${item.href}-${i}`}
                className={
                  isTop3
                    ? "border-b border-zinc-100 dark:border-zinc-800"
                    : rank < items.length
                      ? "border-b border-zinc-50 dark:border-zinc-800/50"
                      : ""
                }
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                    isTop3 ? "bg-zinc-50/70 dark:bg-zinc-800/30" : ""
                  }`}
                >
                  {/* Title */}
                  <span
                    className={`flex-1 min-w-0 text-xs leading-snug line-clamp-2 ${
                      isTop3
                        ? "font-semibold text-zinc-900 dark:text-zinc-100"
                        : "font-medium text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {item.title}
                  </span>

                  {/* Thumbnail with rank badge */}
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                    {item.cover ? (
                      <Image
                        src={item.cover}
                        alt={item.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg opacity-25">
                        👻
                      </div>
                    )}
                    <span
                      className={`absolute left-0 top-0 flex h-5 w-5 items-center justify-center text-[10px] font-black leading-none ${
                        badge
                          ? `${badge.bg} ${badge.text}`
                          : "bg-zinc-600 text-zinc-200"
                      }`}
                    >
                      {rank}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
