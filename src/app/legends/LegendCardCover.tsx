import Image from "next/image";
import { legendImageMap } from "@/lib/legends/imageMap";

type Props = {
  slug: string;
  title: string;
  isNew?: boolean;
};

export default function LegendCardCover({ slug, title, isNew }: Props) {
  const cover = legendImageMap[slug]?.cover;

  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800">
      {cover ? (
        <>
          <Image
            src={`/legends/${slug}/${cover}`}
            alt={`${title} cover`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-black/0" />
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-zinc-400">
          <span className="text-sm font-semibold">怪談</span>
          <span className="text-xs opacity-80">画像準備中</span>
        </div>
      )}
      {isNew && (
        <span className="absolute left-2 top-2 rounded-full bg-emerald-600/90 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
          新着
        </span>
      )}
    </div>
  );
}
