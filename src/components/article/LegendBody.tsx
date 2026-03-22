import Image from "next/image";
import React from "react";
import { slugify } from "@/lib/slugify";
import { legendImageMap } from "@/lib/legends/imageMap";

type Props = {
  slug: string;
  body: string;
};

const IMAGE_MARKERS = ["cover", "scene1", "scene2", "scene3", "scene4"] as const;
type ImageMarker = (typeof IMAGE_MARKERS)[number];

function isImageMarker(token: string): token is ImageMarker {
  return (IMAGE_MARKERS as readonly string[]).includes(token);
}

function extractHeadings(body: string): { text: string; id: string }[] {
  const headings: { text: string; id: string }[] = [];
  const parts = body.split(/\[\[[a-z0-9]+\]\]/gi);
  for (const part of parts) {
    for (const line of part.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("■ ")) {
        const text = trimmed.slice(2).trim();
        headings.push({ text, id: slugify(text) });
      } else if (trimmed.startsWith("## ")) {
        const text = trimmed.slice(3).trim();
        headings.push({ text, id: slugify(text) });
      }
    }
  }
  return headings;
}

function Toc({ headings }: { headings: { text: string; id: string }[] }) {
  if (headings.length < 2) return null;
  return (
    <nav
      aria-label="目次"
      className="my-6 rounded-xl border border-green-200 bg-green-50/60 p-5 dark:border-green-900/40 dark:bg-green-950/10"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">
        目次
      </p>
      <ol className="space-y-1.5">
        {headings.map(({ text, id }, index) => (
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

function renderTextChunk(text: string, chunkIdx: number): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const paras = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  for (let pidx = 0; pidx < paras.length; pidx++) {
    const para = paras[pidx];
    if (para.startsWith("### ")) {
      const headingText = para.slice(4).trim();
      nodes.push(
        <h3
          key={`h3-${chunkIdx}-${pidx}`}
          id={slugify(headingText)}
          className="mt-6 mb-2 text-sm font-bold text-zinc-800 dark:text-zinc-200"
        >
          {headingText}
        </h3>
      );
    } else if (para.startsWith("## ")) {
      const headingText = para.slice(3).trim();
      nodes.push(
        <h2
          key={`h2-${chunkIdx}-${pidx}`}
          id={slugify(headingText)}
          className="mt-8 mb-3 rounded-xl border-l-[6px] border-l-green-500 bg-green-500/10 px-4 py-2.5 text-base font-bold text-zinc-900 dark:text-zinc-100"
        >
          {headingText}
        </h2>
      );
    } else if (para.startsWith("# ")) {
      const headingText = para.slice(2).trim();
      nodes.push(
        <h1
          key={`h1-${chunkIdx}-${pidx}`}
          id={slugify(headingText)}
          className="mt-8 mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100"
        >
          {headingText}
        </h1>
      );
    } else if (para.startsWith("■ ")) {
      const headingText = para.slice(2).trim();
      nodes.push(
        <h2
          key={`h-${chunkIdx}-${pidx}`}
          id={slugify(headingText)}
          className="mt-8 mb-3 rounded-xl border-l-[6px] border-l-green-500 bg-green-500/10 px-4 py-2.5 text-base font-bold text-zinc-900 dark:text-zinc-100"
        >
          {headingText}
        </h2>
      );
    } else {
      nodes.push(
        <p
          key={`p-${chunkIdx}-${pidx}`}
          className="my-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
        >
          {para.split("\n").map((line, li) => (
            <span key={li}>
              {line}
              <br />
            </span>
          ))}
        </p>
      );
    }
  }
  return nodes;
}

export function LegendBody({ slug, body }: Props) {
  const headings = extractHeadings(body);
  const parts = body.split(/\[\[([a-z0-9]+)\]\]/gi);

  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      const text = parts[i];
      if (text.trim().length > 0) {
        nodes.push(...renderTextChunk(text, i));
      }
    } else {
      const token = parts[i].toLowerCase();
      if (token === "toc") {
        nodes.push(<Toc key={`toc-${i}`} headings={headings} />);
      } else if (isImageMarker(token)) {
        const filename = legendImageMap[slug]?.[token];
        if (filename) {
          const src = filename;
          nodes.push(
            <figure key={`img-${i}`} className="my-6">
              <Image
                src={src}
                alt={`${slug} ${token}`}
                width={1280}
                height={720}
                className="w-full rounded-xl"
                priority={token === "cover"}
              />
            </figure>
          );
        }
      } else {
        nodes.push(
          <p
            key={`unknown-${i}`}
            className="my-3 text-sm text-zinc-400 dark:text-zinc-600"
          >
            [[{parts[i]}]]
          </p>
        );
      }
    }
  }

  return <div className="space-y-0">{nodes}</div>;
}
