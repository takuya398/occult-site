"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type NavVariant = "spot" | "story" | "uma" | "mystery";

const navLinks: { href: string; label: string; variant: NavVariant }[] = [
  { href: "/spots", label: "心霊スポット", variant: "spot" },
  { href: "/legends", label: "怪談・都市伝説", variant: "story" },
  { href: "/entities", label: "UMA・異形", variant: "uma" },
  { href: "/mysteries", label: "怪事件・ミステリー", variant: "mystery" },
];

const navPill = (variant: NavVariant) => {
  const colors = {
    spot: {
      bg: "rgba(59,130,246,0.12)",
      border: "rgba(59,130,246,0.35)",
      ring: "rgba(59,130,246,0.18)",
    },
    story: {
      bg: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.35)",
      ring: "rgba(239,68,68,0.18)",
    },
    uma: {
      bg: "rgba(34,197,94,0.12)",
      border: "rgba(34,197,94,0.35)",
      ring: "rgba(34,197,94,0.18)",
    },
    mystery: {
      bg: "rgba(168,85,247,0.12)",
      border: "rgba(168,85,247,0.35)",
      ring: "rgba(168,85,247,0.18)",
    },
  }[variant];

  return {
    className:
      "navPill inline-flex items-center rounded-full border px-3 py-1 text-sm whitespace-nowrap border-slate-200 text-slate-700",
    style: {
      "--pill-bg": colors.bg,
      "--pill-border": colors.border,
      "--pill-ring": colors.ring,
    } as CSSProperties,
  };
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const basePath = useMemo(() => {
    if (pathname.startsWith("/legends")) return "/legends";
    if (pathname.startsWith("/stories")) return "/legends";
    if (pathname.startsWith("/entities")) return "/entities";
    if (pathname.startsWith("/mysteries")) return "/mysteries";
    if (pathname.startsWith("/uma")) return "/uma";
    if (pathname.startsWith("/spots")) return "/spots";
    return "/spots";
  }, [pathname]);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  // Close on ESC
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Focus close button when drawer opens
  useEffect(() => {
    if (menuOpen) closeButtonRef.current?.focus();
  }, [menuOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

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

  const searchInput = (id: string, className: string) => (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <label htmlFor={id} className="sr-only">
        サイト内検索
      </label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="カテゴリ内検索"
        className={className}
      />
    </form>
  );

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur">
        {/* ── 1段目 ── */}
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          {/* サイト名 */}
          <Link href="/" className="text-base font-semibold tracking-tight sm:text-lg">
            Occult Encyclopedia
          </Link>

          {/* PC: ナビ + 検索 */}
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            <nav className="flex items-center gap-3 text-sm text-zinc-600">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                const { className, style } = navPill(link.variant);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${className} ${isActive ? "text-slate-900" : ""}`}
                    style={style}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            {searchInput(
              "site-search-pc",
              "h-9 w-48 rounded-full border border-zinc-200 bg-white px-4 text-sm text-zinc-800 shadow-sm transition-colors focus:border-zinc-400 focus:outline-none sm:w-56"
            )}
          </div>

          {/* Mobile: ハンバーガー */}
          <button
            type="button"
            aria-label="メニューを開く"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition-colors active:bg-zinc-100"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="2" y="4" width="14" height="1.5" rx="0.75" fill="currentColor" />
              <rect x="2" y="8.25" width="14" height="1.5" rx="0.75" fill="currentColor" />
              <rect x="2" y="12.5" width="14" height="1.5" rx="0.75" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* ── 2段目（Mobile専用: 検索） ── */}
        <div className="sm:hidden px-4 pb-3">
          {searchInput(
            "site-search-mobile",
            "h-9 w-full rounded-full border border-zinc-200 bg-white px-4 text-sm text-zinc-800 shadow-sm transition-colors focus:border-zinc-400 focus:outline-none"
          )}
        </div>
      </header>

      {/* ── Drawer ── */}
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 sm:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="ナビゲーションメニュー"
        className={`fixed right-0 top-0 z-50 h-full w-[80%] max-w-sm bg-white shadow-xl transition-transform duration-200 ease-in-out sm:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer ヘッダー */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <span className="text-sm font-semibold text-zinc-700">メニュー</span>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="メニューを閉じる"
            onClick={() => setMenuOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors active:bg-zinc-100"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Drawer ナビ */}
        <nav className="flex flex-col gap-1 px-4 py-5">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={`rounded-lg px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 ${
              pathname === "/" ? "bg-zinc-100 text-zinc-900" : ""
            }`}
          >
            トップへ
          </Link>
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 ${
                  isActive ? "bg-zinc-100 text-zinc-900" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
