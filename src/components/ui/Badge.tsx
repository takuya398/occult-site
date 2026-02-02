import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeProps = {
  children: ReactNode;
  tone?: "neutral" | "emerald" | "rose";
  className?: string;
};

export default function Badge({
  children,
  tone = "neutral",
  className,
}: BadgeProps) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
      : tone === "rose"
        ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
        : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";

  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs",
        toneClass,
        className
      )}
    >
      {children}
    </span>
  );
}
