"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { mysteries } from "@/loaders";
import { Badge, Card, CardLink, TagChip } from "@/components/ui";
import FilterDrawer from "@/components/FilterDrawer";

const ERA_LABELS: Record<string, string> = {
  ancient: "古代",
  medieval: "中世",
  earlyModern: "近世",
  modern: "近代",
  contemporary: "現代",
  unknown: "年代不明",
};

const ERA_OPTIONS = [
  "ancient",
  "medieval",
  "earlyModern",
  "modern",
  "contemporary",
  "unknown",
] as const;

const WORLD_REGION_LABELS: Record<string, string> = {
  asia: "アジア",
  europe: "ヨーロッパ",
  northAmerica: "北米",
  southAmerica: "南米",
  africa: "アフリカ",
  oceania: "オセアニア",
};

const WORLD_REGION_OPTIONS = [
  "asia",
  "europe",
  "northAmerica",
  "southAmerica",
  "africa",
  "oceania",
] as const;

const SORT_LABELS: Record<string, string> = {
  newest: "新着順",
  occurredAsc: "年代順（古い順）",
  occurredDesc: "年代順（新しい順）",
  credibility: "信憑性順",
};

const CRED_ORDER_MAP: Record<string, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };

// Param defaults — omitted from URL when equal to these values
const PARAM_DEFAULTS: Record<string, string> = {
  region: "all",
  pref: "all",
  world: "all",
  era: "all",
  credibility: "all",
  sort: "newest",
  q: "",
};

export default function MysteriesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // All filter state derived from URL (single source of truth) — except free-text query
  const regionFilter = searchParams.get("region") ?? "all";
  const prefectureFilter = searchParams.get("pref") ?? "all";
  const worldRegionFilter = searchParams.get("world") ?? "all";
  const eraFilter = searchParams.get("era") ?? "all";
  const credibilityFilter = searchParams.get("credibility") ?? "all";
  const sortKey = searchParams.get("sort") ?? "newest";

  // Local state: controlled input value（即時反映）。debouncedQueryは確定後にURLへ同期する
  const [inputValue, setInputValue] = useState(() => searchParams.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(() => searchParams.get("q") ?? "");
  const query = inputValue;
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const prefectureOptions = useMemo(
    () =>
      Array.from(
        new Set(
          mysteries
            .filter((item) => item.regionType === "domestic")
            .map((item) => item.prefecture)
            .filter((pref): pref is string => Boolean(pref))
        )
      ),
    []
  );

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
      const qs = params.toString();
      router.replace(qs ? `/mysteries?${qs}` : "/mysteries", { scroll: false });
    },
    [searchParams, router]
  );

  // 入力確定を待ってからURLに反映（300ms debounce）
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 300);

    return () => clearTimeout(handler);
  }, [inputValue]);

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (debouncedQuery.trim() !== current) {
      updateParams({ q: debouncedQuery });
    }
  }, [debouncedQuery, searchParams, updateParams]);

  const handleReset = useCallback(() => {
    setSelectedTags([]);
    setInputValue("");
    setDebouncedQuery("");
    router.replace("/mysteries", { scroll: false });
  }, [router]);

  const handleRegionChange = (next: string) => {
    updateParams({ region: next, pref: "all", world: "all" });
  };

  const tagOptions = useMemo(() => {
    const tags = mysteries.flatMap((item) => item.tags);
    return Array.from(new Set(tags));
  }, []);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredMysteries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const matchesQuery = (item: (typeof mysteries)[number]) => {
      if (!normalizedQuery) return true;
      const haystack = [item.title, item.summary, item.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    };

    const matchesRegion = (item: (typeof mysteries)[number]) => {
      if (regionFilter === "all") return true;
      const regionType = item.regionType ?? "unknown";
      if (regionType !== regionFilter) return false;
      if (regionFilter === "domestic" && prefectureFilter !== "all") {
        return item.prefecture === prefectureFilter;
      }
      if (regionFilter === "overseas" && worldRegionFilter !== "all") {
        return item.worldRegion === worldRegionFilter;
      }
      return true;
    };

    const matchesEra = (item: (typeof mysteries)[number]) => {
      if (eraFilter === "all") return true;
      return (item.era ?? "unknown") === eraFilter;
    };

    const matchesCredibility = (item: (typeof mysteries)[number]) => {
      if (credibilityFilter === "all") return true;
      return item.credibility === credibilityFilter;
    };

    const matchesTags = (item: (typeof mysteries)[number]) => {
      if (selectedTags.length === 0) return true;
      return selectedTags.every((tag) => item.tags.includes(tag));
    };

    const filtered = mysteries.filter(
      (item) =>
        matchesQuery(item) &&
        matchesRegion(item) &&
        matchesEra(item) &&
        matchesCredibility(item) &&
        matchesTags(item)
    );

    const compareOccurredYear = (
      a: (typeof mysteries)[number],
      b: (typeof mysteries)[number],
      direction: "asc" | "desc"
    ) => {
      const av = a.occurredYear ?? null;
      const bv = b.occurredYear ?? null;
      if (av == null && bv == null) {
        return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
      }
      if (av == null) return 1;
      if (bv == null) return -1;
      return direction === "asc" ? av - bv : bv - av;
    };

    return filtered.sort((a, b) => {
      if (sortKey === "occurredAsc") return compareOccurredYear(a, b, "asc");
      if (sortKey === "occurredDesc") return compareOccurredYear(a, b, "desc");
      if (sortKey === "credibility") {
        const diff =
          (CRED_ORDER_MAP[b.credibility ?? ""] ?? 0) -
          (CRED_ORDER_MAP[a.credibility ?? ""] ?? 0);
        if (diff !== 0) return diff;
        return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
      }
      // newest (default)
      return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
    });
  }, [
    query,
    regionFilter,
    prefectureFilter,
    worldRegionFilter,
    eraFilter,
    credibilityFilter,
    selectedTags,
    sortKey,
  ]);

  // Active filter chips
  type Chip = { key: string; label: string; onRemove: () => void };
  const activeChips: Chip[] = [];
  if (regionFilter !== "all") {
    const regionLabel =
      regionFilter === "domestic" ? "国内" : regionFilter === "overseas" ? "海外" : "地域不明";
    const detail =
      regionFilter === "domestic" && prefectureFilter !== "all"
        ? `（${prefectureFilter}）`
        : regionFilter === "overseas" && worldRegionFilter !== "all"
          ? `（${WORLD_REGION_LABELS[worldRegionFilter]}）`
          : "";
    activeChips.push({
      key: "region",
      label: `地域: ${regionLabel}${detail}`,
      onRemove: () => updateParams({ region: "all", pref: "all", world: "all" }),
    });
  }
  if (eraFilter !== "all") {
    activeChips.push({
      key: "era",
      label: `時代: ${ERA_LABELS[eraFilter] ?? eraFilter}`,
      onRemove: () => updateParams({ era: "all" }),
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
        setDebouncedQuery("");
        updateParams({ q: "" });
      },
    });
  }
  if (sortKey !== "newest") {
    activeChips.push({
      key: "sort",
      label: `ソート: ${SORT_LABELS[sortKey] ?? sortKey}`,
      onRemove: () => updateParams({ sort: "newest" }),
    });
  }

  const activeFilterCount = [
    regionFilter !== "all",
    eraFilter !== "all",
    credibilityFilter !== "all",
    query.trim() !== "",
    selectedTags.length > 0,
  ].filter(Boolean).length;

  const filterFields = (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-zinc-500">
          フリーワード
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="例: 古文書 / 失踪 / 暗号"
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
            <option value="newest">新着順</option>
            <option value="occurredAsc">年代順（古い順）</option>
            <option value="occurredDesc">年代順（新しい順）</option>
            <option value="credibility">信憑性順</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs text-zinc-500">
          地域
          <select
            value={regionFilter}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="all">すべて</option>
            <option value="domestic">国内</option>
            <option value="overseas">海外</option>
            <option value="unknown">地域不明</option>
          </select>
        </label>
        <label className="text-xs text-zinc-500">
          時代
          <select
            value={eraFilter}
            onChange={(e) => updateParams({ era: e.target.value })}
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="all">すべて</option>
            {ERA_OPTIONS.map((era) => (
              <option key={era} value={era}>
                {ERA_LABELS[era]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-zinc-500">
          <span title="その謎が通常の説明（自然現象・人為・誤認・心理・既知の科学）にどれだけ耐えているか＝未解明度">
            信憑性
          </span>
          <select
            value={credibilityFilter}
            onChange={(e) => updateParams({ credibility: e.target.value })}
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="all">すべて</option>
            <option value="S">S</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </label>
      </div>

      {regionFilter === "domestic" && (
        <label className="text-xs text-zinc-500">
          都道府県
          <select
            value={prefectureFilter}
            onChange={(e) => updateParams({ pref: e.target.value })}
            className="mt-2 w-full max-w-xs rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="all">すべて</option>
            {prefectureOptions.map((pref) => (
              <option key={pref} value={pref}>
                {pref}
              </option>
            ))}
          </select>
        </label>
      )}

      {regionFilter === "overseas" && (
        <label className="text-xs text-zinc-500">
          世界地域
          <select
            value={worldRegionFilter}
            onChange={(e) => updateParams({ world: e.target.value })}
            className="mt-2 w-full max-w-xs rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="all">すべて</option>
            {WORLD_REGION_OPTIONS.map((region) => (
              <option key={region} value={region}>
                {WORLD_REGION_LABELS[region]}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="space-y-2">
        <p className="text-xs text-zinc-500">タグ（複数選択・AND検索）</p>
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
            怪事件・ミステリー一覧
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300">
            歴史的な未解決事件や謎に迫ります。
          </p>
        </header>

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
          <span>該当 {filteredMysteries.length} 件</span>
        </div>

        <section className="mt-4 grid gap-4 sm:grid-cols-2">
          {filteredMysteries.map((mystery) => (
            <CardLink
              key={mystery.slug}
              href={`/mysteries/${mystery.slug}`}
              ariaLabel={`${mystery.title}の詳細へ`}
              variant="mystery"
              className="group"
            >
              {mystery.coverImage && (
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700">
                  <Image
                    src={mystery.coverImage.src}
                    alt={mystery.coverImage.alt}
                    width={mystery.coverImage.width ?? 1200}
                    height={mystery.coverImage.height ?? 800}
                    className="h-40 w-full object-cover"
                    sizes="(max-width: 768px) 100vw, 480px"
                  />
                </div>
              )}
              {mystery.eraDisplay && (
                <p className="text-xs text-zinc-500">{mystery.eraDisplay}</p>
              )}
              <h2 className="mt-1 text-lg font-semibold tracking-tight line-clamp-2 text-zinc-900 dark:text-zinc-100">
                {mystery.title}
              </h2>
              <p className="mt-1 text-sm leading-snug line-clamp-3 text-zinc-600 dark:text-zinc-400">
                {mystery.summary}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {mystery.tags.slice(0, 4).map((tag) => (
                  <TagChip key={tag}>{tag}</TagChip>
                ))}
              </div>
              {mystery.credibility && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge tone="violet">信憑性 {mystery.credibility}</Badge>
                </div>
              )}
            </CardLink>
          ))}
        </section>

        {filteredMysteries.length === 0 && (
          <section className="mt-6">
            <Card className="p-6 text-center">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                条件に一致する記事がありません
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
