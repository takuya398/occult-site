import Link from "next/link";
import { getSpotEntriesFromArticles } from "@/lib/spot-articles";

export default async function PopularTags() {
  const spots = await getSpotEntriesFromArticles();

  const tagCount: Record<string, number> = {};
  for (const spot of spots) {
    for (const tag of spot.tags) {
      tagCount[tag] = (tagCount[tag] ?? 0) + 1;
    }
  }

  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([tag]) => tag);

  if (topTags.length === 0) return null;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
        人気タグ
      </h2>
      <div className="flex flex-wrap gap-2">
        {topTags.map((tag) => (
          <Link
            key={tag}
            href={`/spots?tags=${encodeURIComponent(tag)}`}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:border-red-700/50 hover:bg-red-50 hover:text-red-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-red-700/50 dark:hover:bg-red-950/30 dark:hover:text-red-300"
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
