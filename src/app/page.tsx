import Link from "next/link";
import type { CSSProperties } from "react";
import RecentList from "@/components/RecentList";
import { CardLink } from "@/components/ui";
import { getAllLatest } from "@/lib/server-loaders";

export default async function Home() {
  const categoryLabel: Record<string, string> = {
    spots: "心霊スポット",
    stories: "怪談・都市伝説",
    uma: "UMA",
    entities: "UMA・異形",
    mysteries: "怪事件・ミステリー",
  };

  const latest = await getAllLatest(6);
  const latestItems = latest.map((item) => ({
    title: item.title,
    href: item.href,
    date: item.publishedAt,
    category: categoryLabel[item.category],
    summary: item.summary,
  }));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#07000a] dark:text-[#e8ddd0] dark:[background-image:radial-gradient(ellipse_at_50%_0%,rgba(74,14,107,0.18)_0%,transparent_55%)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-14">

        {/* ── ヒーロー ── */}
        <header className="space-y-5">
          <p className="gothic-eyebrow text-xs font-semibold uppercase">
            Occult Encyclopedia
          </p>
          <h1 className="gothic-title text-4xl font-bold tracking-tight text-zinc-900 dark:text-[#e8ddd0] sm:text-5xl">
            オカルト図鑑
          </h1>
          <div className="gothic-divider">✦</div>
          <p className="text-base italic text-zinc-500 dark:text-zinc-500 sm:text-lg">
            「深淵の向こうに──何がある」
          </p>
          <p className="max-w-2xl text-sm leading-7 text-zinc-500 dark:text-zinc-500">
            心霊スポット・怪談・都市伝説・UMAを一堂に集めた図鑑。
            記録し、分類し、深淵を覗く。
          </p>
        </header>

        {/* ── 訪問者への警告 ── */}
        <section>
          <div className="rounded-xl border border-red-900/40 bg-red-50 px-5 py-4 text-red-900 dark:border-[#5a0000] dark:bg-[#120002] dark:text-red-300/90">
            <p className="font-semibold text-sm sm:text-base gothic-eyebrow tracking-widest">
              ✝ 訪問者への警告
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm sm:text-base">
              <li>私有地への侵入はNG</li>
              <li>危険行為（廃墟侵入・無理な探索）はNG</li>
              <li>近隣住民への迷惑行為はNG</li>
            </ul>
          </div>
        </section>

        {/* ── カテゴリ ── */}
        <section className="space-y-5">
          <h2 className="gothic-divider text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-600">
            ✦ カテゴリ ✦
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CardLink
              href="/spots"
              ariaLabel="心霊スポットの一覧へ"
              className="group gothic-card"
              variant="spot"
            >
              <div className="mb-3 h-0.5 w-10 rounded-full bg-sky-400/60 dark:bg-sky-300/50" />
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                心霊スポット
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                日本各地のスポット情報を地図感覚で探索。
              </p>
            </CardLink>
            <CardLink
              href="/legends"
              ariaLabel="怪談・都市伝説の一覧へ"
              className="group gothic-card"
              variant="story"
            >
              <div className="mb-3 h-0.5 w-10 rounded-full bg-rose-400/60 dark:bg-rose-300/50" />
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                怪談・都市伝説
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                伝承や目撃談を読み物として整理。
              </p>
            </CardLink>
            <CardLink
              href="/entities"
              ariaLabel="UMA・異形の一覧へ"
              className="group gothic-card"
              variant="uma"
            >
              <div className="mb-3 h-0.5 w-10 rounded-full bg-emerald-400/60 dark:bg-emerald-300/50" />
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                UMA・異形
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                未確認生物・異形の存在を一覧で参照。
              </p>
            </CardLink>
            <CardLink
              href="/mysteries"
              ariaLabel="怪事件・ミステリーの一覧へ"
              className="group gothic-card"
              variant="mystery"
            >
              <div className="mb-3 h-0.5 w-10 rounded-full bg-violet-400/60 dark:bg-violet-300/50" />
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                怪事件・ミステリー
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                未解決の歴史的事件と謎に迫る。
              </p>
            </CardLink>
          </div>
        </section>

        {/* ── 新着 ── */}
        <section className="space-y-5">
          <div className="flex w-full items-center justify-between gap-4">
            <h2 className="gothic-divider flex-1 text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-600">
              ✦ 新着 ✦
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-sm shrink-0">
              <Link
                href="/spots"
                className="navPill inline-flex items-center rounded-full border px-3 py-1 text-sm whitespace-nowrap border-slate-200 text-slate-700 dark:border-zinc-700/60 dark:text-zinc-400"
                style={
                  {
                    "--pill-bg": "rgba(59,130,246,0.10)",
                    "--pill-border": "rgba(59,130,246,0.35)",
                    "--pill-ring": "rgba(59,130,246,0.15)",
                  } as CSSProperties
                }
              >
                心霊スポットへ
              </Link>
              <Link
                href="/legends"
                className="navPill inline-flex items-center rounded-full border px-3 py-1 text-sm whitespace-nowrap border-slate-200 text-slate-700 dark:border-zinc-700/60 dark:text-zinc-400"
                style={
                  {
                    "--pill-bg": "rgba(139,0,0,0.15)",
                    "--pill-border": "rgba(139,0,0,0.45)",
                    "--pill-ring": "rgba(139,0,0,0.15)",
                  } as CSSProperties
                }
              >
                怪談・都市伝説へ
              </Link>
              <Link
                href="/entities"
                className="navPill inline-flex items-center rounded-full border px-3 py-1 text-sm whitespace-nowrap border-slate-200 text-slate-700 dark:border-zinc-700/60 dark:text-zinc-400"
                style={
                  {
                    "--pill-bg": "rgba(34,197,94,0.10)",
                    "--pill-border": "rgba(34,197,94,0.35)",
                    "--pill-ring": "rgba(34,197,94,0.12)",
                  } as CSSProperties
                }
              >
                UMA・異形へ
              </Link>
              <Link
                href="/mysteries"
                className="navPill inline-flex items-center rounded-full border px-3 py-1 text-sm whitespace-nowrap border-slate-200 text-slate-700 dark:border-zinc-700/60 dark:text-zinc-400"
                style={
                  {
                    "--pill-bg": "rgba(168,85,247,0.10)",
                    "--pill-border": "rgba(168,85,247,0.35)",
                    "--pill-ring": "rgba(168,85,247,0.12)",
                  } as CSSProperties
                }
              >
                怪事件へ
              </Link>
            </div>
          </div>
          <RecentList items={latestItems} />
        </section>

        <footer className="text-xs italic text-zinc-500 dark:text-zinc-600">
          「汝、深淵を覗く者よ──くれぐれも安全第一で。」
        </footer>
      </div>
    </div>
  );
}
