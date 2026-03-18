"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { umas } from "@/loaders";
import { Badge, Card, CardLink, TagChip } from "@/components/ui";
import FilterDrawer from "@/components/FilterDrawer";
import { UMA_TAG_CATEGORIES } from "@/data/uma-tags";
import {
  existenceRankScore,
  evidenceRankScore,
  getRecommendDetails,
  calcRecommendScore,
} from "@/lib/uma-score";
import UmaCardCover from "./UmaCardCover";
import { PREFECTURE_ORDER } from "@/constants/prefectures";

// 都道府県フィルター用（geo.scope==="JP" のみ、地域順）
const prefectureOptions = PREFECTURE_ORDER.filter((pref) =>
  umas
    .filter((u) => u.geo?.scope === "JP")
    .flatMap((u) => u.geo?.prefectures ?? [])
    .includes(pref)
);

// 国フィルター用（geo.scope==="INTL" のみ、ユニーク・ソート済）
const countryOptions = Array.from(
  new Set(
    umas
      .filter((u) => u.geo?.scope === "INTL")
      .flatMap((u) => u.geo?.countries ?? [])
      .filter(Boolean)
  )
).sort();

export default function UmaClient({ commentCounts }: { commentCounts: Record<string, number> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [sortKey, setSortKey] = useState("recommend");
  const [existenceRankFilter, setExistenceRankFilter] = useState("all");
  const [dangerFilter, setDangerFilter] = useState("all");
  const [evidenceRankFilter, setEvidenceRankFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState<"ALL" | "JP" | "INTL">("ALL");
  const [prefectureFilter, setPrefectureFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // ソートと表示で共通して使うため1回だけ生成
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const normalizedQuery = query.trim();

    if (normalizedQuery) {
      params.set("q", normalizedQuery);
    } else {
      params.delete("q");
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `?${nextQuery}` : "/uma", {
        scroll: false,
      });
    }
  }, [query, router, searchParams]);

  const filteredUmas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const matchesQuery = (uma: (typeof umas)[number]) => {
      if (!normalizedQuery) return true;
      const haystack = [uma.title, uma.summary, uma.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    };

    const matchesTags = (uma: (typeof umas)[number]) => {
      if (selectedTags.length === 0) return true;
      return selectedTags.every((tag) => uma.tags.includes(tag));
    };

    const matchesDanger = (uma: (typeof umas)[number]) => {
      if (dangerFilter === "all") return true;
      return uma.danger === Number(dangerFilter);
    };

    const matchesExistenceRank = (uma: (typeof umas)[number]) => {
      if (existenceRankFilter === "all") return true;
      return uma.existence_rank === existenceRankFilter;
    };

    const matchesEvidenceRank = (uma: (typeof umas)[number]) => {
      if (evidenceRankFilter === "all") return true;
      return uma.evidence_rank === evidenceRankFilter;
    };

    const matchesGeo = (uma: (typeof umas)[number]) => {
      if (scopeFilter === "ALL") return true;
      const geo = uma.geo;
      // geo未設定の場合はJPとして扱う
      const scope = geo?.scope ?? "JP";
      if (scope !== scopeFilter) return false;
      if (scopeFilter === "JP") {
        if (prefectureFilter === "all") return true;
        return (geo?.prefectures ?? []).includes(prefectureFilter);
      }
      if (scopeFilter === "INTL") {
        if (countryFilter === "all") return true;
        return (geo?.countries ?? []).includes(countryFilter);
      }
      return true;
    };

    const filtered = umas.filter(
      (uma) =>
        matchesQuery(uma) &&
        matchesTags(uma) &&
        matchesDanger(uma) &&
        matchesExistenceRank(uma) &&
        matchesEvidenceRank(uma) &&
        matchesGeo(uma)
    );

    return filtered.sort((a, b) => {
      // 同点タイブレーク：新着順（createdAt降順）
      const byNewest = (x: typeof a, y: typeof b) => {
        const cx = x.createdAt ?? "";
        const cy = y.createdAt ?? "";
        if (cy > cx) return 1;
        if (cy < cx) return -1;
        return 0;
      };

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
      // recommend: finalScore 降順
      const diff = calcRecommendScore(b, today) - calcRecommendScore(a, today);
      return diff !== 0 ? diff : byNewest(a, b);
    });
  }, [
    query,
    selectedTags,
    dangerFilter,
    existenceRankFilter,
    evidenceRankFilter,
    scopeFilter,
    prefectureFilter,
    countryFilter,
    sortKey,
    today,
  ]);

  useEffect(() => {
    setVisibleCount(12);
  }, [filteredUmas]);

  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleCategory = (key: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleReset = () => {
    setQuery("");
    setSortKey("recommend");
    setExistenceRankFilter("all");
    setDangerFilter("all");
    setEvidenceRankFilter("all");
    setScopeFilter("ALL");
    setPrefectureFilter("all");
    setCountryFilter("all");
    setSelectedTags([]);
  };

  // 一次スコープ変更時に二次フィルターをリセット
  const handleScopeChange = (next: "ALL" | "JP" | "INTL") => {
    setScopeFilter(next);
    setPrefectureFilter("all");
    setCountryFilter("all");
  };

  const summaryParts: string[] = [];
  if (query.trim()) summaryParts.push(`キーワード=${query.trim()}`);
  if (existenceRankFilter !== "all") summaryParts.push(`実在度=${existenceRankFilter}`);
  if (dangerFilter !== "all") summaryParts.push(`危険度=${dangerFilter}`);
  if (evidenceRankFilter !== "all") summaryParts.push(`証拠強度=${evidenceRankFilter}`);
  if (scopeFilter === "JP") {
    summaryParts.push(
      prefectureFilter === "all" ? "地域=日本" : `地域=日本（${prefectureFilter}）`
    );
  } else if (scopeFilter === "INTL") {
    summaryParts.push(
      countryFilter === "all" ? "地域=海外" : `地域=海外（${countryFilter}）`
    );
  }
  if (selectedTags.length > 0) summaryParts.push(`タグ=${selectedTags.join(",")}`);
  const summaryText = summaryParts.join(" / ");

  const queryString = searchParams.toString();
  const detailsSuffix = queryString ? `?${queryString}` : "";

  // フィルター入力フォーム（PC インラインとモバイル Drawer で共用）
  const filterFields = (
    <div className="flex flex-col gap-4">
      {/* ① フリーワード + ② ソート */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-zinc-500">
          フリーワード
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例: 雪男 / 湖 / 巨大生物"
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-400"
          />
        </label>
        <label className="text-xs text-zinc-500">
          ソート
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
          >
            <option value="recommend">おすすめ</option>
            <option value="existence_rank">実在度が高い順</option>
            <option value="evidence_rank">証拠強度が高い順</option>
            <option value="danger">危険度が高い順</option>
            <option value="newest">新着順</option>
          </select>
        </label>
      </div>

      {/* ③ 実在度 / ④ 危険度 / ⑤ 証拠強度 / ⑥ 地域（一次） */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs text-zinc-500">
          <span>実在度</span>
          <span
            className="ml-1 cursor-help text-zinc-400"
            title="科学的可能性（S〜D）"
          >
            ?
          </span>
          <select
            value={existenceRankFilter}
            onChange={(event) => setExistenceRankFilter(event.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
          >
            <option value="all">すべて</option>
            <option value="S">S</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </label>
        <label className="text-xs text-zinc-500">
          危険度
          <select
            value={dangerFilter}
            onChange={(event) => setDangerFilter(event.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
          >
            <option value="all">すべて</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </label>
        <label className="text-xs text-zinc-500">
          <span>証拠強度</span>
          <span
            className="ml-1 cursor-help text-zinc-400"
            title="DNA/写真/映像/複数証言などの証拠量（A〜E）"
          >
            ?
          </span>
          <select
            value={evidenceRankFilter}
            onChange={(event) => setEvidenceRankFilter(event.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
          >
            <option value="all">すべて</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
          </select>
        </label>
        <label className="text-xs text-zinc-500">
          地域
          <select
            value={scopeFilter}
            onChange={(event) =>
              handleScopeChange(event.target.value as "ALL" | "JP" | "INTL")
            }
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
          >
            <option value="ALL">すべて</option>
            <option value="JP">日本</option>
            <option value="INTL">海外</option>
          </select>
        </label>
      </div>

      {/* ⑦ 都道府県（日本選択時のみ） */}
      {scopeFilter === "JP" && (
        <label className="text-xs text-zinc-500">
          都道府県
          <select
            value={prefectureFilter}
            onChange={(event) => setPrefectureFilter(event.target.value)}
            className="mt-2 w-full max-w-xs rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
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

      {/* ⑦ 国（海外選択時のみ） */}
      {scopeFilter === "INTL" && (
        <label className="text-xs text-zinc-500">
          国
          <select
            value={countryFilter}
            onChange={(event) => setCountryFilter(event.target.value)}
            className="mt-2 w-full max-w-xs rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
          >
            <option value="all">すべて</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* ⑧ タグ複数選択（カテゴリ別） */}
      <div className="space-y-3">
        <p className="text-xs text-zinc-500">タグ（複数選択・AND検索）</p>
        {(
          Object.entries(UMA_TAG_CATEGORIES) as [
            keyof typeof UMA_TAG_CATEGORIES,
            (typeof UMA_TAG_CATEGORIES)[keyof typeof UMA_TAG_CATEGORIES],
          ][]
        ).map(([key, category]) => {
          const isCollapsed = collapsedCategories.has(key);
          return (
            <div key={key} className="space-y-1.5">
              <button
                type="button"
                onClick={() => toggleCategory(key)}
                className="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              >
                <span>{isCollapsed ? "▶" : "▼"}</span>
                <span>{category.label}</span>
              </button>
              {!isCollapsed && (
                <div className="flex flex-wrap gap-1.5 pl-3">
                  {category.tags.map((tag) => {
                    const isActive = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          isActive
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
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
          <h1 className="text-3xl font-semibold tracking-tight">UMA一覧</h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300">
            目撃情報や伝承を検索・絞り込みできます。
          </p>
        </header>

        {/* Mobile: 絞り込みボタン */}
        <div className="mt-6 flex items-center justify-between sm:hidden">
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 shadow-sm transition-colors active:bg-zinc-50"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 4h12M4 8h8M6 12h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            絞り込み
            {summaryParts.length > 0 && (
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-zinc-800 px-1 text-[11px] text-white">
                {summaryParts.length}
              </span>
            )}
          </button>
          {summaryParts.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-zinc-500 underline"
            >
              リセット
            </button>
          )}
        </div>

        {/* FilterDrawer（モバイル用） */}
        <FilterDrawer
          open={filterOpen}
          onOpenChange={setFilterOpen}
          onReset={handleReset}
        >
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

        {summaryParts.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-200 bg-white p-3 text-sm text-zinc-600">
            <span>条件: {summaryText}</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-zinc-600 underline hover:text-zinc-900"
            >
              条件をクリア
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-sm text-zinc-600">
          <span>該当 {filteredUmas.length} 件</span>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {filteredUmas.slice(0, visibleCount).map((uma) => {
            const details =
              sortKey === "recommend"
                ? getRecommendDetails(uma, today)
                : null;
            const visibleTags = uma.tags.slice(0, 4);
            const extraTagCount = uma.tags.length - 4;
            const isDanger5 = uma.danger === 5;
            return (
              <CardLink
                key={uma.slug}
                href={`/uma/${uma.slug}${detailsSuffix}`}
                ariaLabel={`${uma.title}の詳細へ`}
                variant="uma"
                className={`group overflow-hidden hover:shadow-md${isDanger5 ? " uma-danger5" : ""}`}
              >
                <UmaCardCover slug={uma.slug} isNew={!!details?.isFresh} isDanger5={isDanger5} />

                {/* 上段メタ */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  {uma.type && <TagChip variant="outline">{uma.type}</TagChip>}
                  {uma.region && <span>{uma.region}</span>}
                </div>

                {/* タイトル */}
                <h2 className="mt-2 text-lg font-semibold tracking-tight line-clamp-2 text-zinc-900 dark:text-zinc-100">
                  {uma.title}
                </h2>

                {/* 要約 */}
                <p className="mt-1 text-sm leading-snug line-clamp-2 text-zinc-600 dark:text-zinc-400">
                  {uma.summary}
                </p>

                {/* タグ（最大4 + +N） */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {visibleTags.map((tag) => (
                    <TagChip key={tag}>{tag}</TagChip>
                  ))}
                  {extraTagCount > 0 && (
                    <TagChip variant="outline">+{extraTagCount}</TagChip>
                  )}
                </div>

                {/* バッジ */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {uma.existence_rank && (
                    <Badge tone="neutral">実在 {uma.existence_rank}</Badge>
                  )}
                  {uma.evidence_rank && (
                    <Badge tone="neutral">証拠 {uma.evidence_rank}</Badge>
                  )}
                  {uma.danger != null && (
                    <Badge
                      tone={
                        uma.danger >= 4 ? "rose" : uma.danger <= 2 ? "amber" : "rose"
                      }
                    >
                      危険 {uma.danger}
                    </Badge>
                  )}
                  {details?.hasBonus && <Badge tone="amber">高実在×高証拠</Badge>}
                  {details?.isPopular && <Badge tone="violet">人気</Badge>}
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                  <span>💬 {commentCounts[uma.slug] ?? 0}</span>
                </div>
              </CardLink>
            );
          })}
        </section>

        {visibleCount < filteredUmas.length && (
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

        {filteredUmas.length === 0 && (
          <section className="mt-6">
            <Card className="p-6 text-center">
              <p className="text-sm font-semibold text-zinc-900">
                該当するUMAがありません
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                条件を緩めるか、リセットして再度お試しください。
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 rounded-full border border-zinc-200 px-4 py-2 text-xs text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900"
              >
                条件をリセット
              </button>
            </Card>
          </section>
        )}

        <section className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-900">
          <p className="text-sm font-semibold">注意事項</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>私有地への侵入はNG</li>
            <li>危険行為（廃墟侵入・無理な探索）はNG</li>
            <li>近隣住民への迷惑行為はNG</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
