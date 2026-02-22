import { slugify } from "@/lib/slugify";

interface TocItem {
  text: string;
  id: string;
}

function extractH2s(contentMd: string): TocItem[] {
  const items: TocItem[] = [];
  const regex = /^##\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(contentMd)) !== null) {
    const text = match[1].trim();
    items.push({ text, id: slugify(text) });
  }
  return items;
}

interface Props {
  contentMd: string;
}

export default function UmaToc({ contentMd }: Props) {
  const items = extractH2s(contentMd);
  if (items.length < 2) return null;

  return (
    <nav
      aria-label="目次"
      className="rounded-xl border border-green-200 bg-green-50/60 p-5 dark:border-green-900/40 dark:bg-green-950/10"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">
        目次
      </p>
      <ol className="space-y-1.5">
        {items.map(({ text, id }, index) => (
          <li key={id} className="flex items-baseline gap-2">
            <span className="min-w-[1.25rem] text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
              {index + 1}.
            </span>
            <a
              href={`#${id}`}
              className="text-sm text-zinc-700 transition-colors hover:text-green-600 dark:text-zinc-300 dark:hover:text-green-400"
            >
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
