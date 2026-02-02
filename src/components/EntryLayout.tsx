import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, TagChip, SectionBox } from "@/components/ui";

type BadgeTone = "neutral" | "good" | "warn";

type EntryLayoutProps = {
  backHref: string;
  title: string;
  summary: string;
  metaBadges: { label: string; tone?: BadgeTone }[];
  tags: string[];
  sections: { heading: string; body: ReactNode }[];
  updatedAt?: string;
};

const mapTone = (tone?: BadgeTone) => {
  if (tone === "good") return "emerald" as const;
  if (tone === "warn") return "rose" as const;
  return "neutral" as const;
};

export default function EntryLayout({
  backHref,
  title,
  summary,
  metaBadges,
  tags,
  sections,
  updatedAt,
}: EntryLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="mb-6">
          <Link
            href={backHref}
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            ← 一覧へ戻る
          </Link>
        </div>

        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300">
            {summary}
          </p>
          {updatedAt && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              最終更新: {updatedAt}
            </p>
          )}
        </header>

        <section className="mt-6 flex flex-wrap gap-2 text-xs">
          {metaBadges.map((badge) => (
            <Badge
              key={`${badge.label}-${badge.tone ?? "neutral"}`}
              tone={mapTone(badge.tone)}
            >
              {badge.label}
            </Badge>
          ))}
        </section>

        <section className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagChip key={tag}>{tag}</TagChip>
          ))}
        </section>

        <div className="mt-8 grid gap-4">
          {sections.map((section) => (
            <SectionBox key={section.heading} title={section.heading}>
              {section.body}
            </SectionBox>
          ))}
        </div>
      </div>
    </div>
  );
}
