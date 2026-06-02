"use client";

import { useRouter } from "next/navigation";
import { PREFECTURE_ORDER } from "@/constants/prefectures";

type Props = {
  sort: string;
  prefectureFilter: string;
  scareFilter: number;
};

export default function ExperienceFilters({ sort, prefectureFilter, scareFilter }: Props) {
  const router = useRouter();

  function buildUrl(params: Record<string, string>) {
    const merged = {
      sort,
      prefecture: prefectureFilter,
      scare: scareFilter ? String(scareFilter) : "",
      page: "1",
      ...params,
    };
    const qs = Object.entries(merged)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/experiences${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2 text-xs">
      <select
        value={prefectureFilter}
        onChange={(e) => router.push(buildUrl({ prefecture: e.target.value }))}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-zinc-200"
      >
        <option value="">都道府県（全て）</option>
        {PREFECTURE_ORDER.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
        <option value="不明">不明</option>
        <option value="海外">海外</option>
      </select>
      <select
        value={scareFilter ? String(scareFilter) : ""}
        onChange={(e) => router.push(buildUrl({ scare: e.target.value }))}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-zinc-200"
      >
        <option value="">怖さ（全て）</option>
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {"★".repeat(n)}
          </option>
        ))}
      </select>
      {(prefectureFilter || scareFilter) && (
        <button
          type="button"
          onClick={() => router.push(buildUrl({ prefecture: "", scare: "" }))}
          className="rounded-lg border border-zinc-600 bg-zinc-800 px-2 py-1 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
        >
          リセット
        </button>
      )}
    </div>
  );
}
