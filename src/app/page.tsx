import Link from "next/link";
import type { CSSProperties } from "react";
import RecentList from "@/components/RecentList";
import { CardLink } from "@/components/ui";
import { stories, umas } from "@/loaders";
import { getSpotEntriesFromArticles } from "@/lib/spot-articles";

export default async function Home() {
  const categoryLabel = {
    spots: "心霊スポット",
    stories: "怪談・都市伝説",
    uma: "UMA",
  } as const;

  const spots = await getSpotEntriesFromArticles();
  const merged = [...spots, ...stories, ...umas];
  const latestItems = merged
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 6)
    .map((item) => ({
      title: item.title,
      href: `/${item.category}/${item.slug}`,
      date: item.publishedAt,
      category: categoryLabel[item.category],
      summary: item.summary,
    }));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
            Occult Encyclopedia
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            オカルト図鑑ホーム
          </h1>
          <p className="max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg">
            心霊スポット、怪談・都市伝説、UMAをまとめて探索する図鑑型サイト。
            まだデータが無くても動くように、まずは入口となるページを用意しています。
          </p>
        </header>

        <section className="mt-2">
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-900 shadow-sm dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            <p className="text-sm font-semibold sm:text-base">注意事項</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm sm:text-base">
              <li>私有地への侵入はNG</li>
              <li>危険行為（廃墟侵入・無理な探索）はNG</li>
              <li>近隣住民への迷惑行為はNG</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">カテゴリ</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <CardLink
              href="/spots"
              ariaLabel="心霊スポットの一覧へ"
              className="group"
              variant="spot"
            >
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                心霊スポット
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                日本各地のスポット情報を地図感覚で探索。
              </p>
            </CardLink>
            <CardLink
              href="/stories"
              ariaLabel="怪談・都市伝説の一覧へ"
              className="group"
              variant="story"
            >
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                怪談・都市伝説
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                伝承や目撃談を読み物として整理。
              </p>
            </CardLink>
            <CardLink
              href="/uma"
              ariaLabel="UMAの一覧へ"
              className="group"
              variant="uma"
            >
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                UMA
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                未確認生物の情報を一覧でまとめて参照。
              </p>
            </CardLink>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex w-full items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">新着</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm shrink-0">
              <Link
                href="/spots"
                className="navPill inline-flex items-center rounded-full border px-3 py-1 text-sm whitespace-nowrap border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                style={
                  {
                    "--pill-bg": "rgba(59,130,246,0.12)",
                    "--pill-border": "rgba(59,130,246,0.35)",
                    "--pill-ring": "rgba(59,130,246,0.18)",
                  } as CSSProperties
                }
              >
                心霊スポットへ
              </Link>
              <Link
                href="/stories"
                className="navPill inline-flex items-center rounded-full border px-3 py-1 text-sm whitespace-nowrap border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                style={
                  {
                    "--pill-bg": "rgba(239,68,68,0.12)",
                    "--pill-border": "rgba(239,68,68,0.35)",
                    "--pill-ring": "rgba(239,68,68,0.18)",
                  } as CSSProperties
                }
              >
                怪談・都市伝説へ
              </Link>
              <Link
                href="/uma"
                className="navPill inline-flex items-center rounded-full border px-3 py-1 text-sm whitespace-nowrap border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                style={
                  {
                    "--pill-bg": "rgba(34,197,94,0.12)",
                    "--pill-border": "rgba(34,197,94,0.35)",
                    "--pill-ring": "rgba(34,197,94,0.18)",
                  } as CSSProperties
                }
              >
                UMAへ
              </Link>
            </div>
          </div>
          <RecentList items={latestItems} />
        </section>

        <footer className="text-xs text-zinc-500 dark:text-zinc-400">
          情報は随時追加予定です。安全第一でお楽しみください。
        </footer>
      </div>
    </div>
  );
}
