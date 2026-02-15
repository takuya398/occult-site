import { Badge, TagChip } from "@/components/ui";

export type MetaBadge = {
  label: string;
  tone?: "neutral" | "good" | "warn";
};

type ArticleHeaderProps = {
  categoryLabel: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt?: string;
  metaBadges?: MetaBadge[];
  tags: string[];
};

export default function ArticleHeader({
  categoryLabel,
  title,
  summary,
  publishedAt,
  updatedAt,
  metaBadges = [],
  tags,
}: ArticleHeaderProps) {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <TagChip>{categoryLabel}</TagChip>
        <span>公開日: {publishedAt}</span>
        {updatedAt && <span>更新日: {updatedAt}</span>}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-3xl line-clamp-4 overflow-hidden break-words text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg">
        {summary}
      </p>
      {metaBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {metaBadges.map((badge) => (
            <Badge
              key={`${badge.label}-${badge.tone ?? "neutral"}`}
              tone={badge.tone === "good" ? "emerald" : badge.tone === "warn" ? "rose" : "neutral"}
            >
              {badge.label}
            </Badge>
          ))}
        </div>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagChip key={tag}>{tag}</TagChip>
          ))}
        </div>
      )}
    </header>
  );
}
