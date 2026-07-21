import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="パンくずリスト" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && (
              <span aria-hidden="true" className="select-none">
                /
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="text-zinc-700 dark:text-zinc-300"
                aria-current="page"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
