import Link from "next/link";
import notices from "@/data/notices";

export default function NoticeBoard() {
  if (notices.length === 0) return null;

  return (
    <section>
      <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/60">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          お知らせ
        </h2>
        <ul className="space-y-2">
          {notices.slice(0, 4).map((n, i) => (
            <li key={i} className="flex items-baseline gap-3 text-sm">
              <time className="shrink-0 font-mono text-xs text-zinc-400 dark:text-zinc-500">
                {n.date}
              </time>
              {n.url ? (
                <Link href={n.url} className="text-violet-600 hover:underline dark:text-violet-400">
                  {n.text}
                </Link>
              ) : (
                <span className="text-zinc-700 dark:text-zinc-300">{n.text}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
