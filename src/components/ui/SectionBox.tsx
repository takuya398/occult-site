import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionBoxProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export default function SectionBox({
  title,
  children,
  className,
}: SectionBoxProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      <div className="mt-3 text-sm text-zinc-600">{children}</div>
    </section>
  );
}
