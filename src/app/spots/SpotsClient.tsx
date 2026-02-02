"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { spots } from "@/loaders";
import { Badge, Card, CardLink, TagChip } from "@/components/ui";

export default function SpotsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const parseTags = (value: string | null) =>
    value
      ? value
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

  const getParamValue = (value: string | null, fallback = "all") =>
    value && value.length > 0 ? value : fallback;

  const getInitialState = () => ({
    query: getParamValue(searchParams.get("q"), ""),
    pref: getParamValue(searchParams.get("pref")),
    type: getParamValue(searchParams.get("type")),
    dangerMin: getParamValue(searchParams.get("dangerMin")),
    cred: getParamValue(searchParams.get("cred")),
    tags: parseTags(searchParams.get("tags")),
    sort: getParamValue(searchParams.get("sort"), "recommend"),
  });

  const initialState = getInitialState();

  const [query, setQuery] = useState(initialState.query);
  const [prefFilter, setPrefFilter] = useState(initialState.pref);
  const [typeFilter, setTypeFilter] = useState(initialState.type);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialState.tags);
  const [dangerFilter, setDangerFilter] = useState(initialState.dangerMin);
  const [credibilityFilter, setCredibilityFilter] = useState(initialState.cred);
  const [sortKey, setSortKey] = useState(initialState.sort);
  const [debouncedQuery, setDebouncedQuery] = useState(initialState.query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const nextState = getInitialState();

    if (nextState.query !== query) {
      setQuery(nextState.query);
      setDebouncedQuery(nextState.query);
    }
    if (nextState.pref !== prefFilter) {
      setPrefFilter(nextState.pref);
    }
    if (nextState.type !== typeFilter) {
      setTypeFilter(nextState.type);
    }
    if (nextState.dangerMin !== dangerFilter) {
      setDangerFilter(nextState.dangerMin);
    }
    if (nextState.cred !== credibilityFilter) {
      setCredibilityFilter(nextState.cred);
    }
    if (nextState.sort !== sortKey) {
      setSortKey(nextState.sort);
    }
    if (nextState.tags.join(",") !== selectedTags.join(",")) {
      setSelectedTags(nextState.tags);
    }
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    const normalizedQuery = debouncedQuery.trim();

    if (normalizedQuery) params.set("q", normalizedQuery);
    if (prefFilter !== "all") params.set("pref", prefFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (dangerFilter !== "all") params.set("dangerMin", dangerFilter);
    if (credibilityFilter !== "all") params.set("cred", credibilityFilter);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    if (sortKey !== "recommend") params.set("sort", sortKey);

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `?${nextQuery}` : "/spots", {
        scroll: false,
      });
    }
  }, [
    debouncedQuery,
    prefFilter,
    typeFilter,
    dangerFilter,
    credibilityFilter,
    selectedTags,
    sortKey,
    router,
    searchParams,
  ]);

  const prefOptions = useMemo(() => {
    const prefs = spots
      .map((spot) => spot.pref)
      .filter((pref): pref is string => Boolean(pref));
    return Array.from(new Set(prefs));
  }, []);

  const typeOptions = useMemo(() => {
    const types = spots
      .map((spot) => spot.type)
      .filter((type): type is string => Boolean(type));
    return Array.from(new Set(types));
  }, []);

  const tagOptions = useMemo(() => {
    const tags = spots.flatMap((spot) => spot.tags);
    return Array.from(new Set(tags));
  }, []);

  const filteredSpots = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const matchesQuery = (spot: (typeof spots)[number]) => {
      if (!normalizedQuery) return true;
      const haystack = [
        spot.title,
        spot.summary,
        spot.pref ?? "",
        spot.type ?? "",
        spot.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    };

    const matchesPref = (spot: (typeof spots)[number]) => {
      if (prefFilter === "all") return true;
      return spot.pref === prefFilter;
    };

    const matchesType = (spot: (typeof spots)[number]) => {
      if (typeFilter === "all") return true;
      return spot.type === typeFilter;
    };

    const matchesTags = (spot: (typeof spots)[number]) => {
      if (selectedTags.length === 0) return true;
      return selectedTags.every((tag) => spot.tags.includes(tag));
    };

    const matchesDanger = (spot: (typeof spots)[number]) => {
      if (dangerFilter === "all") return true;
      const danger = spot.danger ?? 0;
      if (dangerFilter === "5") return danger === 5;
      const threshold = Number(dangerFilter);
      return danger >= threshold;
    };

    const matchesCredibility = (spot: (typeof spots)[number]) => {
      if (credibilityFilter === "all") return true;
      return spot.credibility === credibilityFilter;
    };

    const credibilityScore = (credibility?: string) => {
      switch (credibility) {
        case "S":
          return 5;
        case "A":
          return 4;
        case "B":
          return 3;
        case "C":
          return 2;
        case "D":
          return 1;
        default:
          return 0;
      }
    };

    const sorted = spots
      .filter(
        (spot) =>
          matchesQuery(spot) &&
          matchesPref(spot) &&
          matchesType(spot) &&
          matchesTags(spot) &&
          matchesDanger(spot) &&
          matchesCredibility(spot)
      )
      .sort((a, b) => {
        if (sortKey === "danger") {
          const dangerDiff = (b.danger ?? 0) - (a.danger ?? 0);
          if (dangerDiff !== 0) return dangerDiff;
          return a.title.localeCompare(b.title, "ja");
        }
        if (sortKey === "credibility") {
          const credDiff =
            credibilityScore(b.credibility) -
            credibilityScore(a.credibility);
          if (credDiff !== 0) return credDiff;
          const dangerDiff = (b.danger ?? 0) - (a.danger ?? 0);
          if (dangerDiff !== 0) return dangerDiff;
          return a.title.localeCompare(b.title, "ja");
        }
        if (sortKey === "pref") {
          const prefA = a.pref ?? "未設定";
          const prefB = b.pref ?? "未設定";
          const prefDiff = prefA.localeCompare(prefB, "ja");
          if (prefDiff !== 0) return prefDiff;
          return a.title.localeCompare(b.title, "ja");
        }
        const credDiff =
          credibilityScore(b.credibility) - credibilityScore(a.credibility);
        if (credDiff !== 0) return credDiff;
        const dangerDiff = (b.danger ?? 0) - (a.danger ?? 0);
        if (dangerDiff !== 0) return dangerDiff;
        return a.title.localeCompare(b.title, "ja");
      });

    return sorted;
  }, [
    query,
    prefFilter,
    typeFilter,
    selectedTags,
    dangerFilter,
    credibilityFilter,
    sortKey,
  ]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleReset = () => {
    setQuery("");
    setPrefFilter("all");
    setTypeFilter("all");
    setSelectedTags([]);
    setDangerFilter("all");
    setCredibilityFilter("all");
    setSortKey("recommend");
    setDebouncedQuery("");
  };

  const summaryParts: string[] = [];
  if (query.trim()) summaryParts.push(`キーワード=${query.trim()}`);
  if (prefFilter !== "all") summaryParts.push(`都道府県=${prefFilter}`);
  if (typeFilter !== "all") summaryParts.push(`種別=${typeFilter}`);
  if (dangerFilter !== "all") {
    summaryParts.push(
      `危険度=${dangerFilter === "5" ? "5のみ" : `${dangerFilter}以上`}`
    );
  }
  if (credibilityFilter !== "all") {
    summaryParts.push(`信憑性=${credibilityFilter}`);
  }
  if (selectedTags.length > 0) {
    summaryParts.push(`タグ=${selectedTags.join(",")}`);
  }
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
          <h1 className="text-3xl font-semibold tracking-tight">
            心霊スポット一覧
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300">
            検索・絞り込み・ソートで気になるスポットを探せます。
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

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-zinc-500">
                  フリーワード
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="例: トンネル / 群馬 / 廃墟"
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
                    <option value="danger">危険度が高い順</option>
                    <option value="credibility">信憑性が高い順</option>
                    <option value="pref">都道府県順</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="text-xs text-zinc-500">
                  都道府県
                  <select
                    value={prefFilter}
                    onChange={(event) => setPrefFilter(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
                  >
                    <option value="all">すべて</option>
                    {prefOptions.map((pref) => (
                      <option key={pref} value={pref}>
                        {pref}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-zinc-500">
                  種別
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
                  >
                    <option value="all">すべて</option>
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
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
                    onChange={(event) => setCredibilityFilter(event.target.value)}
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
          <span>該当 {filteredSpots.length} 件</span>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {filteredSpots.map((spot) => (
            <CardLink
              key={spot.slug}
              href={`/spots/${spot.slug}${detailsSuffix}`}
              ariaLabel={`${spot.title}の詳細へ`}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                {spot.pref && <TagChip variant="outline">{spot.pref}</TagChip>}
                {spot.type && <TagChip variant="outline">{spot.type}</TagChip>}
              </div>
              <h2 className="mt-3 text-lg font-semibold text-zinc-900">
                {spot.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-600">{spot.summary}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {spot.tags.map((tag) => (
                  <TagChip key={tag}>{tag}</TagChip>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {spot.credibility && (
                  <Badge tone="emerald">信憑性 {spot.credibility}</Badge>
                )}
                {spot.danger && (
                  <Badge tone="rose">危険度 {spot.danger}</Badge>
                )}
              </div>
            </CardLink>
          ))}
        </section>

        {filteredSpots.length === 0 && (
          <section className="mt-6">
            <Card className="p-6 text-center">
              <p className="text-sm font-semibold text-zinc-900">
                該当するスポットがありません
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
