"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { href: "/spots", label: "心霊スポット" },
  { href: "/stories", label: "怪談・都市伝説" },
  { href: "/uma", label: "UMA" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  const basePath = useMemo(() => {
    if (pathname.startsWith("/stories")) return "/stories";
    if (pathname.startsWith("/uma")) return "/uma";
    if (pathname.startsWith("/spots")) return "/spots";
    return "/spots";
  }, [pathname]);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }

    const nextQuery = params.toString();
    router.push(nextQuery ? `${basePath}?${nextQuery}` : basePath);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Occult Encyclopedia
          </Link>
          <div className="sm:hidden">
            <ThemeToggle />
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 ${
                  isActive ? "text-zinc-900 dark:text-zinc-100" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <label htmlFor="site-search" className="sr-only">
              サイト内検索
            </label>
            <input
              id="site-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="カテゴリ内検索"
              className="h-9 w-48 rounded-full border border-zinc-200 bg-white px-4 text-sm text-zinc-800 shadow-sm transition-colors focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500 sm:w-56"
            />
          </form>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
