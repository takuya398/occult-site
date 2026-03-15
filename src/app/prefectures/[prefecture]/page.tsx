import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getSpotEntriesFromArticles } from "@/lib/spot-articles";
import { PREFECTURE_ORDER } from "@/constants/prefectures";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateStaticParams() {
  const spots = await getSpotEntriesFromArticles();
  const prefSet = new Set(spots.map((s) => s.pref).filter(Boolean));
  return PREFECTURE_ORDER.filter((pref) => prefSet.has(pref)).map((pref) => ({
    prefecture: pref,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}): Promise<Metadata> {
  const { prefecture } = await params;
  const pref = decodeURIComponent(prefecture);
  return {
    title: `${pref}の心霊スポット一覧｜オカルト図鑑`,
    description: `${pref}にある心霊スポットをまとめた一覧ページです。危険度・信憑性つきで紹介しています。`,
  };
}

export default async function PrefecturePage({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}) {
  const { prefecture } = await params;
  const pref = decodeURIComponent(prefecture);
  const spots = await getSpotEntriesFromArticles();
  const prefSpots = spots
    .filter((s) => s.pref === pref)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <Breadcrumbs
          items={[
            { label: "トップ", href: "/" },
            { label: "心霊スポット", href: "/spots" },
            { label: pref },
          ]}
        />

        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          {pref}の心霊スポット
        </h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          {prefSpots.length}件のスポットが見つかりました
        </p>

        {prefSpots.length === 0 ? (
          <p className="text-zinc-500">
            このエリアのスポットはまだ登録されていません。
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prefSpots.map((spot) => (
              <Link
                key={spot.slug}
                href={`/spots/${spot.slug}`}
                className="group flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                {spot.coverImage ? (
                  <div className="overflow-hidden rounded-t-xl">
                    <Image
                      src={spot.coverImage.src}
                      alt={spot.coverImage.alt}
                      width={600}
                      height={400}
                      className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-40 rounded-t-xl bg-zinc-100 dark:bg-zinc-800" />
                )}
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="mb-1 font-semibold text-zinc-900 transition-colors group-hover:text-violet-700 dark:text-zinc-100 dark:group-hover:text-violet-300">
                    {spot.title}
                  </h2>
                  <p className="line-clamp-2 flex-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {spot.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {spot.danger && (
                      <span className="rounded px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        危険度 {spot.danger}
                      </span>
                    )}
                    {spot.credibility && (
                      <span className="rounded px-1.5 py-0.5 text-xs bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        信憑性 {spot.credibility}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
