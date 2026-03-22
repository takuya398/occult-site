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
        p: ({ node, children }) => {
          const hasImage =
            node?.children?.some(
              (child) => child.type === "element" && child.tagName === "img"
            ) ?? false;
          if (hasImage) return <div>{children}</div>;
          // **太字のみ**の段落（小見出し扱い）は上マージンを大きく
          const isStrongOnly =
            node?.children?.some(
              (child) => child.type === "element" && child.tagName === "strong"
            ) &&
            node?.children?.every(
              (child) =>
                (child.type === "element" && child.tagName === "strong") ||
                (child.type === "text" && String(child.value).trim() === "")
            );
          if (isStrongOnly) {
            return (
              <p className="mt-6 mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {children}
              </p>
            );
          }
          return (
            <p className="my-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {children}
            </p>
          );
        },
        ul: ({ children }) => (
          <ul className="my-3 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
            {children}
          </ul>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        // eslint-disable-next-line @next/next/no-img-element
        img: ({ src, alt }) => {
          const isContain = typeof src === "string" && src.includes("contain");
          const objectClass = isContain ? "object-contain object-center" : "object-cover object-center";
          return (
            <figure className="my-8">
              <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl bg-slate-50">
                <img
                  src={src}
                  alt={alt ?? ""}
                  className={"absolute inset-0 w-full h-full " + objectClass}
                  loading="lazy"
                />
              </div>
            </figure>
          );
        },
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
