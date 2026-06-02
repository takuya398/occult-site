import Link from "next/link";
import ScareStars from "./ScareStars";
import { formatBoardDate, formatStoryNo } from "@/lib/experiences/format";
import { buildExperienceUrl } from "@/lib/experiences/slugify";
import type { Experience } from "@/lib/experiences/types";

type Props = { experience: Experience };

export default function ExperienceCard({ experience: e }: Props) {
  const href = buildExperienceUrl(e.story_no, e.slug);
  const preview = e.body.slice(0, 120) + (e.body.length > 120 ? "…" : "");

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
      {/* ヘッダー行 */}
      <p className="mb-1 font-mono text-xs text-zinc-400 dark:text-zinc-500">
        No.{formatStoryNo(e.story_no)}：
        <span className="text-green-600 dark:text-green-400">{e.display_name}</span>
        ：{formatBoardDate(e.created_at)}
      </p>

      {/* メタ */}
      <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
        {e.prefecture}
        {e.place_name && `｜${e.place_name}`}
        ｜怖さ{" "}
        <ScareStars level={e.scare_level} className="text-amber-400" />
      </p>

      {/* タイトル */}
      <Link href={href} className="mb-2 block text-base font-bold text-zinc-900 hover:underline dark:text-zinc-100">
        {e.title}
      </Link>

      {/* 本文プレビュー */}
      <p className="mb-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{preview}</p>

      {/* フッター */}
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        コメント {e.comment_count}件　👻 怖かった {e.like_count}
      </p>
    </article>
  );
}
