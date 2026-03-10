import Image from "next/image";
import Link from "next/link";

const CATEGORY_CONFIG: Record<string, { label: string; accent: string; border: string }> = {
  spots:     { label: "心霊スポット",       accent: "text-sky-600 dark:text-sky-400",     border: "group-hover:border-sky-300/60 dark:group-hover:border-sky-700/60" },
  legends:   { label: "怪談・都市伝説",     accent: "text-rose-600 dark:text-rose-400",   border: "group-hover:border-rose-300/60 dark:group-hover:border-rose-700/60" },
  stories:   { label: "怪談・都市伝説",     accent: "text-rose-600 dark:text-rose-400",   border: "group-hover:border-rose-300/60 dark:group-hover:border-rose-700/60" },
  uma:       { label: "UMA・異形",          accent: "text-emerald-600 dark:text-emerald-400", border: "group-hover:border-emerald-300/60 dark:group-hover:border-emerald-700/60" },
  entities:  { label: "UMA・異形",          accent: "text-emerald-600 dark:text-emerald-400", border: "group-hover:border-emerald-300/60 dark:group-hover:border-emerald-700/60" },
  mysteries: { label: "怪事件・ミステリー", accent: "text-violet-600 dark:text-violet-400", border: "group-hover:border-violet-300/60 dark:group-hover:border-violet-700/60" },
};

export type RelatedItem = {
  href: string;
  title: string;
  summary: string;
  tags: string[];
  coverImage?: string;
  publishedAt?: string;
  category?: string;
};

type RelatedProps = {
  items: RelatedItem[];
  heading?: string;
};

export default function Related({ items, heading = "関連記事" }: RelatedProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{heading}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const config = item.category ? (CATEGORY_CONFIG[item.category] ?? null) : null;
          const formattedDate = item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : null;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.title}
              className={[
                "group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm",
                "transition-all duration-200",
                "hover:shadow-md",
                "dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-zinc-900/60",
                config?.border ?? "group-hover:border-zinc-300 dark:group-hover:border-zinc-700",
              ].join(" ")}
            >
              {/* サムネイル */}
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {item.coverImage ? (
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* テキスト */}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {config && (
                    <span className={`font-medium ${config.accent}`}>{config.label}</span>
                  )}
                  {formattedDate && (
                    <span className="text-zinc-400 dark:text-zinc-500">{formattedDate}</span>
                  )}
                </div>
                <h4 className="line-clamp-2 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
                  {item.title}
                </h4>
                <p className="line-clamp-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {item.summary}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
