import Link from "next/link";
import { umas } from "@/data/uma";

export default function UmaPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            ← トップへ戻る
          </Link>
        </div>

        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">UMA一覧</h1>
          <p className="text-base text-zinc-600">
            絞り込み機能は今後追加予定です。気になる存在からチェックしてください。
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {umas.map((uma) => (
            <Link
              key={uma.slug}
              href={`/uma/${uma.slug}`}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                {uma.type && (
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5">
                    {uma.type}
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-lg font-semibold text-zinc-900">
                {uma.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-600">{uma.summary}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {uma.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {uma.credibility && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                    信憑性 {uma.credibility}
                  </span>
                )}
                {uma.danger && (
                  <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-700">
                    危険度 {uma.danger}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-900">
          <p className="text-sm font-semibold">注意事項</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>私有地への侵入はNG</li>
            <li>危険行為（廃墟侵入・無理な探索）はNG</li>
            <li>近隣住民への迷惑行為はNG</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
