import { CardLink, TagChip } from "@/components/ui";
import type { GlowVariant } from "@/components/ui/glow";

export type RecentItem = {
  title: string;
  href: string;
  date: string;
  category: string;
  summary?: string;
};

type RecentCardProps = {
  item: RecentItem;
};

export default function RecentCard({ item }: RecentCardProps) {
  const variantMap: Record<string, GlowVariant> = {
    心霊スポット: "spot",
    "怪談・都市伝説": "story",
    UMA: "uma",
  };

  const variant = variantMap[item.category];

  return (
    <CardLink
      href={item.href}
      ariaLabel={`${item.title}の詳細へ`}
      variant={variant}
      className="group rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 sm:p-5"
    >
      <div className="flex gap-4">
        <div
          className="h-16 w-20 flex-shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800"
          aria-hidden="true"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <TagChip className="text-[11px]">{item.category}</TagChip>
            <span>{item.date}</span>
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {item.title}
          </h3>
          {item.summary && (
            <p className="line-clamp-2 overflow-hidden break-words text-sm text-zinc-600 dark:text-zinc-300">
              {item.summary}
            </p>
          )}
        </div>
      </div>
    </CardLink>
  );
}
