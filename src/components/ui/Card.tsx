import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { glowClass, type GlowVariant } from "@/components/ui/glow";

type CardProps = {
  children: ReactNode;
  className?: string;
};

type CardLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  variant?: GlowVariant;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardLink({
  href,
  children,
  className,
  ariaLabel,
  variant,
}: CardLinkProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-5 shadow-sm cursor-pointer transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-700 dark:focus-visible:ring-offset-zinc-950",
        variant ? glowClass(variant) : "",
        className
      )}
    >
      {children}
    </Link>
  );
}
