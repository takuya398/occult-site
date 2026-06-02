import { type Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";
import ExperienceCard from "@/components/experiences/ExperienceCard";
import ExperienceFilters from "@/components/experiences/ExperienceFilters";
import type { Experience } from "@/lib/experiences/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "心霊体験談一覧",
  description: "読者から寄せられた実際の不思議な体験談を掲載しています。",
  robots: { index: true, follow: true },
};

const PAGE_SIZE = 20;
const SORT_OPTIONS = [
  { key: "new", label: "新しい順" },
  { key: "old", label: "古い順" },
  { key: "scary", label: "怖かった順" },
  { key: "popular", label: "評価順" },
] as const;

type SearchParams = { sort?: string; prefecture?: string; scare?: string; page?: string };

type Props = { searchParams: Promise<SearchParams> };

export default async function ExperiencesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const sort = sp.sort ?? "new";
  const prefectureFilter = sp.prefecture ?? "";
  const scareFilter = sp.scare ? parseInt(sp.scare) : 0;
  const page = Math.max(1, parseInt(sp.page ?? "1") || 1);

  const supabase = createAdminClient();

  let query = supabase
    .from("experiences")
    .select("*", { count: "exact" })
    .eq("status", "published");

  if (prefectureFilter) {
    query = query.eq("prefecture", prefectureFilter);
  }
  if (scareFilter >= 1 && scareFilter <= 5) {
    query = query.eq("scare_level", scareFilter);
  }

  if (sort === "old") {
    query = query.order("created_at", { ascending: true });
  } else if (sort === "scary") {
    query = query.order("like_count", { ascending: false }).order("created_at", { ascending: false });
  } else if (sort === "popular") {
    query = query.order("comment_count", { ascending: false }).order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, count } = await query;
  const experiences = (data ?? []) as Experience[];
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function buildUrl(params: Record<string, string>) {
    const merged = { sort, prefecture: prefectureFilter, scare: scareFilter ? String(scareFilter) : "", page: "1", ...params };
    const qs = Object.entries(merged)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/experiences${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="gothic-title mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">心霊体験談</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            読者から寄せられた実際の不思議な体験談を掲載しています。あなたの体験も投稿できます。
          </p>
          <Link
            href="/experiences/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-violet-700 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-600"
          >
            体験談を投稿する →
          </Link>
        </div>

        {/* 並び替えタブ */}
        <div className="mb-4 flex gap-1 text-sm">
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt.key}
              href={buildUrl({ sort: opt.key })}
              className={`rounded-full px-3 py-1 ${sort === opt.key ? "bg-violet-700 text-white" : "text-zinc-500 hover:text-zinc-200"}`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* フィルター */}
        <ExperienceFilters sort={sort} prefectureFilter={prefectureFilter} scareFilter={scareFilter} />

        {/* 一覧 */}
        {experiences.length === 0 ? (
          <p className="text-sm text-zinc-500">体験談がまだありません。</p>
        ) : (
          <div className="space-y-4">
            {experiences.map((e) => <ExperienceCard key={e.id} experience={e} />)}
          </div>
        )}

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2 text-sm">
            {page > 1 && (
              <Link href={buildUrl({ page: String(page - 1) })} className="rounded-lg border border-zinc-700 px-3 py-1 text-zinc-400 hover:text-zinc-200">
                ← 前
              </Link>
            )}
            <span className="text-zinc-500">{page} / {totalPages}</span>
            {page < totalPages && (
              <Link href={buildUrl({ page: String(page + 1) })} className="rounded-lg border border-zinc-700 px-3 py-1 text-zinc-400 hover:text-zinc-200">
                次 →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
