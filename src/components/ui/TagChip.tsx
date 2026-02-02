import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type TagChipProps = {
  children: ReactNode;
  variant?: "default" | "outline";
  className?: string;
};

export default function TagChip({
  children,
  variant = "default",
  className,
}: TagChipProps) {
  const styles =
    variant === "outline"
      ? "border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200";

  return (
    <span
      className={cn("rounded-full px-2.5 py-1 text-xs", styles, className)}
    >
      {children}
    </span>
  );
}
