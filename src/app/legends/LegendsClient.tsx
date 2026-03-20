"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { legends } from "@/loaders";
import { Badge, Card, TagChip } from "@/components/ui";
import FilterDrawer from "@/components/FilterDrawer";
import { calcLegendScore } from "@/lib/legend-score";
import LegendCardCover from "./LegendCardCover";

const TYPE_LABELS: Record<string, string> = {
  kaidan: "怪談",
  urban: "都市伝説",
  "imi-kowa": "意味怖",
};

const SORT_LABELS: Record<string, string> = {
  new: "新着",
  popular: "人気",
  danger: "危険度",
  credible: "信憑性",
};

const TYPE_OPTIONS = ["kaidan", "urban", "imi-kowa"] as const;

const CRED_ORDER_MAP: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 };

// Param defaults — omitted from URL when equal to these values
const PARAM_DEFAULTS: Record<string, string> = {
  type: "all",
  danger: "all",
  credibility: "all",
  sort: "recommended",
  q: "",
};

export default function LegendsClient({ commentCounts }: { commentCounts: Record<string, number> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = useMemo(() => new Date(), []);

  // All filter state derived from URL (single source of truth)
  const query = searchParams.get("q") ?? "";
  const typeFilter = searchParams.get("type") ?? "all";
  const dangerFilter = searchParams.get("danger") ?? "all";
  const credibilityFilter = searchParams.get("credibility") ?? "all";
  const sortKey = searchParams.get("sort") ?? "recommended";

  // Local state: controlled input value (synced from URL on back/forward)
  const [inputValue, setInputValue] = useState(() => searchParams.get("q") ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setInputValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  // Central URL updater: sets params and deletes defaults to keep URLs clean
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        const normalized = key === "q" ? value.trim() : value;
        if (normalized === (PARAM_DEFAULTS[key] ?? "")) {
          params.delete(key);
        } else {
          params.set(key, normalized);
        }
      }
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `/legends?${qs}` : "/legends", { scroll: false });
    },
    [searchParams, router]
  );

  const handleReset = useCallback(() => {
    setSelectedTags([]);
    setInputValue("");
    router.replace("/legends", { scroll: false });
  }, [router]);

  const tagOptions = useMemo(() => {
    const tags = legends.flatMap((item) => item.tags);
    return Array.from(new Set(tags));
  }, []);

  const filteredLegends = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const matchesQuery = (item: (typeof legends)[number]) => {
      if (!normalizedQuery) return true;
      const haystack = [
        item.title,
        item.summary,
        item.excerpt ?? "",
        item.type,
        item.tags.join(" "),
        (item.body ?? "").slice(0, 1200),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    };

    const matchesType = (item: (typeof legends)[number]) => {
      if (typeFilter === "all") return true;
      return item.type === typeFilter;
    };

    const matchesDanger = (item: (typeof legends)[number]) => {
      if (dangerFilter === "all") return true;
      const danger = item.danger ?? 0;
      if (dangerFilter === "5") return danger === 5;
      return danger >= Number(dangerFilter);
    };

    const matchesCredibility = (item: (typeof legends)[number]) => {
      if (credibilityFilter === "all") return true;
      return item.credibility === credibilityFilter;
    };

    const matchesTags = (item: (typeof legends)[number]) => {
      if (selectedTags.length === 0) return true;
      return selectedTags.every((tag) => item.tags.includes(tag));
    };

    const filtered = legends.filter(
      (item) =>
        matchesQuery(item) &&
        matchesType(item) &&
        matchesDanger(item) &&
        matchesCredibility(item) &&
        matchesTags(item)
    );

    return filtered.sort((a, b) => {
      if (sortKey === "new") {
        const diff = Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
        return diff !== 0 ? diff : a.slug.localeCompare(b.slug);
      }
      if (sortKey === "oldest") {
        const diff = Date.parse(a.publishedAt) - Date.parse(b.publishedAt);
        return diff !== 0 ? diff : a.slug.localeCompare(b.slug);
      }
      if (sortKey === "popular") {
        const diff = (b.views30d ?? 0) - (a.views30d ?? 0);
        if (diff !== 0) return diff;
        return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
      }
      if (sortKey === "danger") {
        const diff = (b.danger ?? 0) - (a.danger ?? 0);
        if (diff !== 0) return diff;
        return a.title.localeCompare(b.title, "ja");
      }
      if (sortKey === "credible") {
        const diff =
          (CRED_ORDER_MAP[b.credibility ?? ""] ?? 0) -
          (CRED_ORDER_MAP[a.credibility ?? ""] ?? 0);
        if (diff !== 0) return diff;
        return (b.danger ?? 0) - (a.danger ?? 0);
      }
      // recommended (default)
      const scoreDiff = calcLegendScore(b, today) - calcLegendScore(a, today);
      if (scoreDiff !== 0) return scoreDiff;
      const viewsDiff = (b.views30d ?? 0) - (a.views30d ?? 0);
      if (viewsDiff !== 0) return viewsDiff;
      const dateDiff = Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
      if (dateDiff !== 0) return dateDiff;
      return a.slug.localeCompare(b.slug);
    });
  }, [query, typeFilter, dangerFilter, credibilityFilter, sortKey, selectedTags, today]);

  useEffect(() => {
    setVisibleCount(12);
  }, [filteredLegends]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Active filter chips (type / danger / credibility / q / sort)
  type Chip = { key: string; label: string; onRemove: () => void };
  const activeChips: Chip[] = [];
  if (typeFilter !== "all") {
    activeChips.push({
      key: "type",
      label: TYPE_LABELS[typeFilter] ?? typeFilter,
      onRemove: () => updateParams({ type: "all" }),
    });
  }
  if (dangerFilter !== "all") {
    activeChips.push({
      key: "danger",
      label: dangerFilter === "5" ? "危険度 5のみ" : `危険度 ${dangerFilter}以上`,
      onRemove: () => updateParams({ danger: "all" }),
    });
  }
  if (credibilityFilter !== "all") {
    activeChips.push({
      key: "credibility",
      label: `信憑性 ${credibilityFilter}`,
      onRemove: () => updateParams({ credibility: "all" }),
    });
  }
  if (query.trim()) {
    activeChips.push({
      key: "q",
      label: `キーワード: ${query.trim()}`,
      onRemove: () => {
        setInputValue("");
        updateParams({ q: "" });
      },
    });
  }
  if (sortKey !== "recommended") {
    activeChips.push({
      key: "sort",
      label: `ソート: ${SORT_LABELS[sortKey] ?? sortKey}`,
      onRemove: () => updateParams({ sort: "recommended" }),
    });
  }

  const activeFilterCount = [
    typeFilter !== "all",
    dangerFilter !== "all",
    credibilityFilter !== "all",
    query.trim() !== "",
    selectedTags.length > 0,
  ].filter(Boolean).length;

  const queryString = searchParams.toString();
  const detailsSuffix = queryString ? `?${queryString}` : "";

  const filterFields = (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-zinc-500">
          フリーワード
          <input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              updateParams({ q: e.target.value });
            }}
            placeholder="例: 学校 / 鏡 / 電車"
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="text-xs text-zinc-500">
          ソート
          <select
            value={sortKey}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="recommended">おすすめ</option>
            <option value="new">新着順</option>
            <option value="oldest">古い順</option>
            <option value="popular">人気順</option>
            <option value="danger">危険度が高い順</option>
            <option value="credible">信憑性が高い順</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs text-zinc-500">
          種別
          <select
            value={typeFilter}
            onChange={(e) => updateParams({ type: e.target.value })}
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="all">すべて</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-zinc-500">
          危険度
          <select
            value={dangerFilter}
            onChange={(e) => updateParams({ danger: e.target.value })}
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="all">すべて</option>
            <option value="1">1以上</option>
            <option value="2">2以上</option>
            <option value="3">3以上</option>
            <option value="4">4以上</option>
            <option value="5">5のみ</option>
          </select>
        </label>
        <label className="text-xs text-zinc-500">
          信憑性
          <select
            value={credibilityFilter}
            onChange={(e) => updateParams({ credibility: e.target.value })}
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="all">すべて</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
          </select>
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-zinc-500">タグ（複数選択）</p>
        <div className="flex flex-wrap gap-2">
          {tagOptions.map((tag) => {
            const isActive = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleToggleTag(tag)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  isActive
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            ← トップへ戻る
          </Link>
        </div>

        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            怪談・都市伝説一覧
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300">
            検索・絞り込み・ソートで気になる話を探せます。
          </p>
        </header>

        {/* Mobile: 絞り込みボタン */}
        <div className="mt-6 flex items-center justify-between sm:hidden">
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 shadow-sm transition-colors active:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            絞り込み
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-zinc-800 px-1 text-[11px] text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeChips.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-zinc-500 underline"
            >
              リセット
            </button>
          )}
        </div>

        <FilterDrawer open={filterOpen} onOpenChange={setFilterOpen} onReset={handleReset}>
          {filterFields}
        </FilterDrawer>

        {/* PC: フィルター（インライン） */}
        <section className="mt-8 hidden sm:block">
          <Card>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  検索・絞り込み
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-100"
                >
                  リセット
                </button>
              </div>
              {filterFields}
            </div>
          </Card>
        </section>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {chip.label}
                <button
                  type="button"
                  onClick={chip.onRemove}
                  aria-label={`${chip.label}を解除`}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              すべて解除
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>該当 {filteredLegends.length} 件</span>
        </div>

        <section className="mt-4 grid gap-4 sm:grid-cols-2">
          {filteredLegends.slice(0, visibleCount).map((item) => {
            const isNew =
              today.getTime() - new Date(item.publishedAt).getTime() <
              7 * 24 * 60 * 60 * 1000;
            return (
              <Link
                key={item.slug}
                href={`/legends/${item.slug}${detailsSuffix}`}
                aria-label={`${item.title}の詳細へ`}
                className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <LegendCardCover slug={item.slug} title={item.title} isNew={isNew} />

                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <TagChip variant="outline">{TYPE_LABELS[item.type] ?? item.type}</TagChip>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight line-clamp-2 text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm leading-snug line-clamp-2 text-zinc-600 dark:text-zinc-400">
                    {item.excerpt ?? item.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 4).map((tag) => (
                      <TagChip key={tag}>{tag}</TagChip>
                    ))}
                    {item.tags.length > 4 && (
                      <TagChip variant="outline">+{item.tags.length - 4}</TagChip>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.danger !== undefined && (
                      <Badge tone="rose">危険 {item.danger}</Badge>
                    )}
                    {item.credibility && (
                      <Badge tone="neutral">信憑性 {item.credibility}</Badge>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                    <span>💬 {commentCounts[item.slug] ?? 0}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        {visibleCount < filteredLegends.length && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              もっと表示する
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {filteredLegends.length === 0 && (
          <section className="mt-6">
            <Card className="p-6 text-center">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                該当する怪談・都市伝説がありません
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                条件を緩めるか、リセットして再度お試しください。
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 rounded-full border border-zinc-200 px-4 py-2 text-xs text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
              >
                条件をリセット
              </button>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
