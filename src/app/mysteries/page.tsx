import Link from "next/link";
import { mysteries } from "@/loaders";
import { CardLink, TagChip } from "@/components/ui";

export default function MysteriesPage() {
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
            怪事件・歴史ミステリー一覧
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300">
            歴史的な未解決事件や謎に迫ります。
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {mysteries.map((mystery) => (
            <CardLink
              key={mystery.slug}
              href={`/mysteries/${mystery.slug}`}
              ariaLabel={`${mystery.title}の詳細へ`}
              variant="story"
              className="group"
            >
              {mystery.era && (
                <p className="text-xs text-zinc-500">{mystery.era}</p>
              )}
              <h2 className="mt-1 text-lg font-semibold tracking-tight line-clamp-2 text-zinc-900 dark:text-zinc-100">
                {mystery.title}
              </h2>
              <p className="mt-1 text-sm leading-snug line-clamp-3 text-zinc-600 dark:text-zinc-400">
                {mystery.summary}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {mystery.tags.slice(0, 4).map((tag) => (
                  <TagChip key={tag}>{tag}</TagChip>
                ))}
              </div>
            </CardLink>
          ))}
        </section>

        <div className="mt-3 text-sm text-zinc-500">
          全 {mysteries.length} 件
        </div>
      </div>
    </div>
  );
}
