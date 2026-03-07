"use client";

import { useEffect, useState } from "react";

interface TocItem {
  text: string;
  id: string;
}

interface Props {
  items: TocItem[];
}

export default function SpotToc({ items }: Props) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-96px 0px -60% 0px",
        threshold: 0,
      },
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="目次"
      className="rounded-xl border border-violet-200 bg-violet-50/60 p-5 dark:border-violet-900/40 dark:bg-violet-950/10"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-400">
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
              className={`text-sm transition-colors ${
                activeId === id
                  ? "font-semibold text-violet-700 dark:text-violet-300"
                  : "text-zinc-700 hover:text-violet-600 dark:text-zinc-300 dark:hover:text-violet-400"
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
