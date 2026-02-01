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
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "rose"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-zinc-200 bg-zinc-50 text-zinc-600";

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
