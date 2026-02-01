import Link from "next/link";

const links = [
  { href: "/", label: "トップへ戻る" },
  { href: "/spots", label: "心霊スポット一覧へ" },
  { href: "/stories", label: "怪談・都市伝説一覧へ" },
  { href: "/uma", label: "UMA一覧へ" },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-zinc-500">404 Not Found</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            ページが見つかりませんでした
          </h1>
          <p className="mt-3 text-sm text-zinc-600">
            URLが間違っているか、ページが移動・削除された可能性があります。
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
