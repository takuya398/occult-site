import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "オカルト図鑑へのお問い合わせはこちらからどうぞ。",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f7] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← トップへ
          </Link>
        </div>

        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">お問い合わせ</h1>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            記事の誤りのご指摘・掲載情報の削除依頼・その他ご意見はこちらからどうぞ。
          </p>
        </header>

        <form
          action="https://formspree.io/f/placeholder"
          method="POST"
          className="space-y-6"
        >
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              お名前
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="山田 太郎"
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="example@email.com"
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>

          <div>
            <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              件名
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              placeholder="お問い合わせの件名"
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>

          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              メッセージ
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              placeholder="お問い合わせ内容をご記入ください"
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            送信する
          </button>
        </form>

        <p className="mt-6 text-xs text-zinc-400 dark:text-zinc-500">
          ご返信までに数日いただく場合がございます。あらかじめご了承ください。
        </p>
      </div>
    </div>
  );
}
