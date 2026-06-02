import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";
import { formatStoryNo } from "@/lib/experiences/format";
import { buildExperienceUrl } from "@/lib/experiences/slugify";
import type { Experience } from "@/lib/experiences/types";

type Props = { spotSlug: string };

export default async function SpotExperienceSection({ spotSlug }: Props) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("experiences")
    .select("id, story_no, slug, title, like_count, comment_count")
    .eq("related_spot_slug", spotSlug)
    .eq("status", "published")
    .order("like_count", { ascending: false })
    .limit(5);

  const experiences = (data ?? []) as Pick<
    Experience,
    "id" | "story_no" | "slug" | "title" | "like_count" | "comment_count"
  >[];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
      {/* この場所の体験談 */}
      {experiences.length > 0 && (
        <div className="mb-5">
          <p className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            この場所の体験談
          </p>
          <ul className="space-y-2">
            {experiences.map((e) => (
              <li key={e.id}>
                <Link
                  href={buildExperienceUrl(e.story_no, e.slug)}
                  className="flex items-baseline gap-2 text-sm text-violet-700 hover:underline dark:text-violet-400"
                >
                  <span className="font-mono text-xs text-zinc-400">
                    No.{formatStoryNo(e.story_no)}
                  </span>
                  <span className="line-clamp-1">{e.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-50/5 px-4 py-4 dark:bg-violet-900/10">
        <p className="mb-2 text-sm text-zinc-700 dark:text-zinc-300">
          この場所で不思議な体験をしましたか？
        </p>
        <Link
          href={`/experiences/new?spot=${encodeURIComponent(spotSlug)}`}
          className="inline-flex items-center gap-1 rounded-full bg-violet-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-violet-600"
        >
          あなたの体験談を投稿する →
        </Link>
      </div>
    </div>
  );
}
