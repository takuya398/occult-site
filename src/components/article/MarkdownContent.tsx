"use client";

import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "@/lib/slugify";

/** ReactNodeから再帰的にプレーンテキストを抽出する */
function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node !== null && typeof node === "object" && "props" in node) {
    const element = node as { props: { children?: ReactNode } };
    return extractText(element.props.children);
  }
  return "";
}

interface Props {
  content: string;
}

export default function MarkdownContent({ content }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => {
          const id = slugify(extractText(children));
          return (
            <h2
              id={id}
              className="mt-8 mb-3 rounded-xl border-l-[6px] border-l-green-500 bg-green-500/10 px-4 py-2.5 text-base font-bold text-zinc-900 dark:text-zinc-100"
            >
              {children}
            </h2>
          );
        },
        h3: ({ children }) => (
          <h3 className="mt-5 mb-2 text-base font-semibold text-green-700 dark:text-green-400">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="my-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="my-3 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
            {children}
          </ul>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        // eslint-disable-next-line @next/next/no-img-element
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt ?? ""}
            className="my-4 w-full rounded-lg object-cover"
          />
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
            {children}
          </strong>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
