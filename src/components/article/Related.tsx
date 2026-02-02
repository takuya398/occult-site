import { CardLink, TagChip } from "@/components/ui";

export type RelatedItem = {
  href: string;
  title: string;
  summary: string;
  tags: string[];
};

type RelatedProps = {
  items: RelatedItem[];
  heading?: string;
};

export default function Related({ items, heading = "関連記事" }: RelatedProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {heading}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <CardLink key={item.href} href={item.href} ariaLabel={item.title} className="p-4">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {item.title}
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
              {item.summary}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.tags.slice(0, 3).map((tag) => (
                <TagChip key={tag}>{tag}</TagChip>
              ))}
            </div>
          </CardLink>
        ))}
      </div>
    </section>
  );
}
