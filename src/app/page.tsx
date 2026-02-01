import { Card, CardLink, TagChip } from "@/components/ui";
import { spots, stories, umas } from "@/data/loaders";

export default function Home() {
  type RecentItem = {
    label: string;
    title: string;
    href: string;
    updatedAt: string;
  };

  const recentItems: RecentItem[] = [
    ...spots.map((spot) => ({
      label: "心霊スポット",
      title: spot.title,
      href: `/spots/${spot.slug}`,
      updatedAt: spot.updatedAt,
    })),
    ...stories.map((story) => ({
      label: "怪談・都市伝説",
      title: story.title,
      href: `/stories/${story.slug}`,
      updatedAt: story.updatedAt,
    })),
    ...umas.map((uma) => ({
      label: "UMA",
      title: uma.title,
      href: `/uma/${uma.slug}`,
      updatedAt: uma.updatedAt,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Occult Encyclopedia
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            オカルト図鑑ホーム
          </h1>
          <p className="max-w-3xl text-base leading-7 text-zinc-600 sm:text-lg">
            心霊スポット、怪談・都市伝説、UMAをまとめて探索する図鑑型サイト。
            まだデータが無くても動くように、まずは入口となるページを用意しています。
          </p>
        </header>

        <section className="sticky top-4 z-10">
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-900 shadow-sm">
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
              <p className="text-lg font-semibold text-zinc-900">心霊スポット</p>
              <p className="mt-2 text-sm text-zinc-600">
                日本各地のスポット情報を地図感覚で探索。
              </p>
            </CardLink>
            <CardLink
              href="/stories"
              ariaLabel="怪談・都市伝説の一覧へ"
              className="group"
            >
              <p className="text-lg font-semibold text-zinc-900">怪談・都市伝説</p>
              <p className="mt-2 text-sm text-zinc-600">
                伝承や目撃談を読み物として整理。
              </p>
            </CardLink>
            <CardLink
              href="/uma"
              ariaLabel="UMAの一覧へ"
              className="group"
            >
              <p className="text-lg font-semibold text-zinc-900">UMA</p>
              <p className="mt-2 text-sm text-zinc-600">
                未確認生物の情報を一覧でまとめて参照。
              </p>
            </CardLink>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">新着</h2>
          <div className="grid gap-3">
            {recentItems.length === 0 ? (
              <Card className="rounded-lg p-4 text-sm text-zinc-600">
                新着は準備中です
              </Card>
            ) : (
              recentItems.map((item) => (
                <CardLink
                  key={item.href}
                  href={item.href}
                  ariaLabel={`${item.title}の詳細へ`}
                  className="rounded-lg p-4"
                >
                  <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-700">
                    <TagChip>{item.label}</TagChip>
                    <span className="font-medium text-zinc-900">
                      {item.title}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {item.updatedAt}
                    </span>
                  </div>
                </CardLink>
              ))
            )}
          </div>
        </section>

        <footer className="text-xs text-zinc-500">
          情報は随時追加予定です。安全第一でお楽しみください。
        </footer>
      </div>
    </div>
  );
}
