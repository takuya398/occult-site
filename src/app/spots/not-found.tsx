import Link from "next/link";

export default function SpotsNotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-zinc-500">404 Not Found</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            心霊スポットが見つかりませんでした
          </h1>
          <p className="mt-3 text-sm text-zinc-600">
            一覧に戻って別のスポットを探してください。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/spots"
              className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
            >
              心霊スポット一覧へ
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
            >
              トップへ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
