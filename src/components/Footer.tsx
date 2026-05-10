import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            © 2026 オカルト図鑑
          </p>
          <nav className="flex flex-wrap justify-center gap-5 text-sm text-zinc-500 dark:text-zinc-400">
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              お問い合わせ
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              サイトについて
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
