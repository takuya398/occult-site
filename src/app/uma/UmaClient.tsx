"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { umas } from "@/loaders";
import { Badge, Card, CardLink, TagChip } from "@/components/ui";

// モジュールレベルで定義（SSR/CSRで常に同じ値を保証しHydration Mismatchを防ぐ）
const regionOptions = Array.from(
  new Set(umas.map((uma) => uma.region).filter(Boolean))
);

const tagOptions = Array.from(new Set(umas.flatMap((uma) => uma.tags)));

// 数値マッピング（厳守）
const EXISTENCE_RANK_SCORE: Record<string, number> = {
  S: 5, A: 4, B: 3, C: 2, D: 1,
};

const EVIDENCE_RANK_SCORE: Record<string, number> = {
  A: 5, B: 4, C: 3, D: 2, E: 1,
};

const existenceRankScore = (rank?: string): number =>
  rank ? (EXISTENCE_RANK_SCORE[rank] ?? 0) : 0;

const evidenceRankScore = (rank?: string): number =>
  rank ? (EVIDENCE_RANK_SCORE[rank] ?? 0) : 0;

type UmaItem = (typeof umas)[number];

const calcRecommendScore = (uma: UmaItem, today: Date): number => {
  const existenceValue = existenceRankScore(uma.existence_rank);
  const evidenceValue = evidenceRankScore(uma.evidence_rank);
  const dangerLevel = uma.danger ?? 0;

  // 3-1: ベーススコア（研究価値）
  const baseScore =
    existenceValue * 0.35 + evidenceValue * 0.25 + dangerLevel * 0.20;

  // 3-2: 閲覧数補正（暴走防止のためlog使用）
  const viewScore = Math.log10((uma.views ?? 0) + 1) * 0.10;

  // 3-3: 新規性補正（公開30日以内のみ）
  let freshScore = 0;
  if (uma.createdAt) {
    const created = new Date(uma.createdAt);
    const days = Math.floor(
      (today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );
    freshScore = Math.max(0, 30 - days) / 30 * 0.10;
  }

  // 4: ボーナス（実在度と証拠強度が両方 >= 4 の場合）
  const bonus = existenceValue >= 4 && evidenceValue >= 4 ? 0.3 : 0;

  // 5: 最終スコア
  return baseScore + viewScore + freshScore + bonus;
};

export default function UmaClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [sortKey, setSortKey] = useState("recommend");
  const [existenceRankFilter, setExistenceRankFilter] = useState("all");
  const [dangerFilter, setDangerFilter] = useState("all");
  const [evidenceRankFilter, setEvidenceRankFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

    const matchesRegion = (uma: (typeof umas)[number]) => {
      if (regionFilter === "all") return true;
      return uma.region === regionFilter;
    };

    const filtered = umas.filter(
      (uma) =>
        matchesQuery(uma) &&
        matchesTags(uma) &&
        matchesDanger(uma) &&
        matchesExistenceRank(uma) &&
        matchesEvidenceRank(uma) &&
        matchesRegion(uma)
    );

    // today はソート全体で1回だけ生成
    const today = new Date();

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
    regionFilter,
    sortKey,
  ]);

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
    setRegionFilter("all");
    setSelectedTags([]);
  };

  const summaryParts: string[] = [];
  if (query.trim()) summaryParts.push(`キーワード=${query.trim()}`);
  if (existenceRankFilter !== "all") summaryParts.push(`実在度=${existenceRankFilter}`);
  if (dangerFilter !== "all") {
    summaryParts.push(`危険度=${dangerFilter}`);
  }
  if (evidenceRankFilter !== "all") summaryParts.push(`証拠強度=${evidenceRankFilter}`);
  if (regionFilter !== "all") summaryParts.push(`地域=${regionFilter}`);
  if (selectedTags.length > 0) summaryParts.push(`タグ=${selectedTags.join(",")}`);
  const summaryText = summaryParts.join(" / ");

  const queryString = searchParams.toString();
  const detailsSuffix = queryString ? `?${queryString}` : "";

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

        <section className="mt-8">
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

              {/* ③ 実在度 / ④ 危険度 / ⑤ 証拠強度 / ⑥ 地域 */}
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
                    value={regionFilter}
                    onChange={(event) => setRegionFilter(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
                  >
                    <option value="all">すべて</option>
                    {regionOptions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* ⑦ タグ複数選択 */}
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
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
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
          {filteredUmas.map((uma) => (
            <CardLink
              key={uma.slug}
              href={`/uma/${uma.slug}${detailsSuffix}`}
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
            </CardLink>
          ))}
        </section>

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