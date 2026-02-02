import { CardLink } from "@/components/ui";

type PrevNextItem = {
  href: string;
  title: string;
  label: string;
};

type PrevNextProps = {
  prev?: PrevNextItem;
  next?: PrevNextItem;
};

export default function PrevNext({ prev, next }: PrevNextProps) {
  if (!prev && !next) return null;

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {prev && (
        <CardLink href={prev.href} ariaLabel={prev.title} className="p-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{prev.label}</p>
          <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {prev.title}
          </p>
        </CardLink>
      )}
      {next && (
        <CardLink href={next.href} ariaLabel={next.title} className="p-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{next.label}</p>
          <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {next.title}
          </p>
        </CardLink>
      )}
    </section>
  );
}
