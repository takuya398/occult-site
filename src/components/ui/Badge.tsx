import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeProps = {
  children: ReactNode;
  tone?: "neutral" | "emerald" | "rose" | "amber" | "sky" | "violet";
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
        : tone === "amber"
          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
          : tone === "sky"
            ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200"
            : tone === "violet"
              ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-200"
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
