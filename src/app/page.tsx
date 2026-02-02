import Link from "next/link";
import RecentList from "@/components/RecentList";
import { CardLink } from "@/components/ui";
import { spots, stories, umas } from "@/data/loaders";

export default function Home() {
  type LatestItem = {
    title: string;
    href: string;
    date: string;
    category: string;
    summary?: string;
    time: number;
  };

  const toTime = (date?: string) => {
    if (!date) return 0;
    const time = Date.parse(date);
    return Number.isNaN(time) ? 0 : time;
  };

  const latestItems: LatestItem[] = [
    ...spots.map((spot) => {
      const date = spot.updatedAt ?? spot.createdAt ?? "";
      return {
        title: spot.title,
        href: `/spots/${spot.slug}`,
        date,
        category: "心霊スポット",
        summary: spot.summary,
        time: toTime(date),
      };
    }),
    ...stories.map((story) => {
      const date = story.updatedAt ?? story.createdAt ?? "";
      return {
        title: story.title,
        href: `/stories/${story.slug}`,
        date,
        category: "怪談・都市伝説",
        summary: story.summary,
        time: toTime(date),
      };
    }),
    ...umas.map((uma) => {
      const date = uma.updatedAt ?? uma.createdAt ?? "";
      return {
        title: uma.title,
        href: `/uma/${uma.slug}`,
        date,
        category: "UMA",
        summary: uma.summary,
        time: toTime(date),
      };
    }),
  ]
    .sort((a, b) => b.time - a.time)
    .slice(0, 6);

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

        <section className="sticky top-4 z-10">
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
                className="cursor-pointer rounded-md border border-zinc-200 px-2 py-1 text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-black dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                心霊スポットへ
              </Link>
              <Link
                href="/stories"
                className="cursor-pointer rounded-md border border-zinc-200 px-2 py-1 text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-black dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                怪談・都市伝説へ
              </Link>
              <Link
                href="/uma"
                className="cursor-pointer rounded-md border border-zinc-200 px-2 py-1 text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-black dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
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
