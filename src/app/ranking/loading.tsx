export default function RankingLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Header skeleton */}
        <div className="mb-8 space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-72 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Period tabs skeleton */}
        <div className="mb-4 h-11 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />

        {/* Category tabs skeleton */}
        <div className="mb-8 flex gap-2">
          {[80, 96, 80, 56, 96].map((w, i) => (
            <div
              key={i}
              className="h-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800"
              style={{ width: w }}
            />
          ))}
        </div>

        {/* Top 3 skeleton */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border-2 border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="aspect-video w-full animate-pulse bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>

        {/* List skeleton */}
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-zinc-100 px-4 py-4 last:border-0 dark:border-zinc-800"
            >
              <div className="h-5 w-5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-14 w-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
