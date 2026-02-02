import RecentCard, { type RecentItem } from "@/components/RecentCard";
import { Card } from "@/components/ui";

type RecentListProps = {
  items: RecentItem[];
};

export default function RecentList({ items }: RecentListProps) {
  if (items.length === 0) {
    return (
      <Card className="rounded-lg p-4 text-sm text-zinc-600 dark:text-zinc-300">
        新着は準備中です
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <RecentCard key={item.href} item={item} />
      ))}
    </div>
  );
}
