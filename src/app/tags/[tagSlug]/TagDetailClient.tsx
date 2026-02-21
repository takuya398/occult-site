"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { umas } from "@/loaders";
import { Badge, Card, CardLink, TagChip } from "@/components/ui";
import {
  existenceRankScore,
  evidenceRankScore,
  getRecommendDetails,
  calcRecommendScore,
} from "@/lib/uma-score";
import { getRelatedTags } from "@/data/uma-tag-slugs";

type SortKey = "recommend" | "existence_rank" | "evidence_rank" | "danger" | "newest";

// カテゴリごとのチップ配色（Tailwind静的クラス）
const CATEGORY_CHIP_CLASSES: Record<string, string> = {
  "生息環境":
    "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-300",
  "形態":
    "border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-400 dark:border-sky-800/50 dark:bg-sky-950/30 dark:text-sky-300",
  "特徴":
    "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300",
  "由来・証拠":
    "border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-400 dark:border-violet-800/50 dark:bg-violet-950/30 dark:text-violet-300",
};

const DEFAULT_CHIP_CLASSES =
  "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200";

interface Props {
  tagName: string;
}

export default function TagDetailClient({ tagName }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("recommend");

  const today = useMemo(() => new Date(), []);

  // 現在のタグに絞ったUMA一覧（ソートなし）
  // relatedTags と filteredUmas の両方で参照し、ソート変更で再計算されないよう分離
  const umasInThisTag = useMemo(
    () => umas.filter((u) => u.tags.includes(tagName)),
    [tagName]
  );

  // ソート適用済みリスト
  const filteredUmas = useMemo(() => {
    const byNewest = (
      a: (typeof umas)[number],
      b: (typeof umas)[number]
    ) => {
      const ca = a.createdAt ?? "";
      const cb = b.createdAt ?? "";
      if (cb > ca) return 1;
      if (cb < ca) return -1;
      return 0;
    };

    return [...umasInThisTag].sort((a, b) => {
      if (sortKey === "existence_rank") {
        const diff =
          existenceRankScore(b.existence_rank) -
          existenceRankScore(a.existence_rank);
        return diff !== 0 ? diff : byNewest(a, b);
      }
      if (sortKey === "evidence_rank") {
        const diff =
          evidenceRankScore(b.evidence_rank) -
          evidenceRankScore(a.evidence_rank);
        return diff !== 0 ? diff : byNewest(a, b);
      }
      if (sortKey === "danger") {
        const diff = (b.danger ?? 0) - (a.danger ?? 0);
        return diff !== 0 ? diff : byNewest(a, b);
      }
      if (sortKey === "newest") {
        return byNewest(a, b);
      }
      // recommend
      const diff = calcRecommendScore(b, today) - calcRecommendScore(a, today);
      return diff !== 0 ? diff : byNewest(a, b);
    });
  }, [umasInThisTag, sortKey, today]);

  // 関連タグ（ソートに依存しない）
  const relatedTags = useMemo(
    () => getRelatedTags(umasInThisTag, tagName),
    [umasInThisTag, tagName]
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <Link
            href="/uma"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← UMA一覧へ
          </Link>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <Link
            href="/tags"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            タグ一覧
          </Link>
        </div>

        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            タグ:{" "}
            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-2xl dark:border-zinc-700 dark:bg-zinc-900">
              {tagName}
            </span>
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300">
            {filteredUmas.length} 件のUMAが見つかりました。
          </p>
        </header>

        {/* 関連タグ（0件なら非表示） */}
        {relatedTags.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              関連タグ
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedTags.map((rt) => {
                const chipClass =
                  CATEGORY_CHIP_CLASSES[rt.categoryLabel] ?? DEFAULT_CHIP_CLASSES;
                return (
                  <Link
                    key={rt.tagSlug}
                    href={`/tags/${rt.tagSlug}`}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${chipClass}`}
                  >
                    <span>{rt.tagName}</span>
                    <span className="text-xs opacity-60">({rt.count})</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-6">
          <Card>
            <label className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="shrink-0">ソート</span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="w-full max-w-xs rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
              >
                <option value="recommend">おすすめ</option>
                <option value="existence_rank">実在度が高い順</option>
                <option value="evidence_rank">証拠強度が高い順</option>
                <option value="danger">危険度が高い順</option>
                <option value="newest">新着順</option>
              </select>
            </label>
          </Card>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {filteredUmas.map((uma) => {
            const details =
              sortKey === "recommend"
                ? getRecommendDetails(uma, today)
                : null;
            return (
              <CardLink
                key={uma.slug}
                href={`/uma/${uma.slug}`}
                ariaLabel={`${uma.title}の詳細へ`}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  {uma.type && <TagChip variant="outline">{uma.type}</TagChip>}
                  {uma.region && <span>{uma.region}</span>}
                </div>
                <h2 className="mt-3 text-lg font-semibold text-zinc-900">
                  {uma.title}
                </h2>
                <p className="mt-2 text-sm text-zinc-600">{uma.summary}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {uma.tags.map((tag) => (
                    <TagChip key={tag}>{tag}</TagChip>
                  ))}
                </div>

                {details ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <Badge tone="neutral">実在度 {uma.existence_rank}</Badge>
                    <Badge tone="neutral">証拠 {uma.evidence_rank}</Badge>
                    {uma.danger != null && (
                      <Badge tone="rose">危険 {"★".repeat(uma.danger)}</Badge>
                    )}
                    {details.hasBonus && (
                      <Badge tone="amber">高実在×高証拠</Badge>
                    )}
                    {details.isFresh && <Badge tone="sky">新着</Badge>}
                    {details.isPopular && <Badge tone="violet">人気</Badge>}
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {uma.existence_rank && (
                      <Badge tone="neutral">実在度 {uma.existence_rank}</Badge>
                    )}
                    {uma.evidence_rank && (
                      <Badge tone="emerald">証拠強度 {uma.evidence_rank}</Badge>
                    )}
                    {uma.danger && (
                      <Badge tone="rose">危険度 {uma.danger}</Badge>
                    )}
                  </div>
                )}
              </CardLink>
            );
          })}
        </section>

        {filteredUmas.length === 0 && (
          <section className="mt-6">
            <Card className="p-6 text-center">
              <p className="text-sm font-semibold text-zinc-900">
                該当するUMAがありません
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                このタグにはまだUMAが登録されていません。
              </p>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
