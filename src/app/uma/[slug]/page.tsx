import Link from "next/link";
import { notFound } from "next/navigation";
import { umas } from "@/data/uma";

export function generateStaticParams() {
  return umas.map((uma) => ({ slug: uma.slug }));
}

type UmaDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function UmaDetailPage({
  params,
}: UmaDetailPageProps) {
  const { slug } = await params;
  const uma = umas.find((item) => item.slug === slug);

  if (!uma) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="mb-6">
          <Link
            href="/uma"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            ← 一覧へ戻る
          </Link>
        </div>

        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">{uma.title}</h1>
          <p className="text-base text-zinc-600">{uma.summary}</p>
        </header>

        <section className="mt-6 flex flex-wrap gap-2 text-xs">
          {uma.type && (
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-600">
              {uma.type}
            </span>
          )}
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
        </section>

        <section className="mt-6 flex flex-wrap gap-2">
          {uma.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600"
            >
              {tag}
            </span>
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

        <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">出典</h2>
          <p className="mt-2 text-sm text-zinc-600">準備中</p>
        </section>
      </div>
    </div>
  );
}
