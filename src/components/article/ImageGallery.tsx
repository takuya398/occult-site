import Image from "next/image";
import type { ImageMedia } from "@/types";

const getImageSize = (image: ImageMedia) => ({
  width: image.width ?? 1200,
  height: image.height ?? 800,
});

type ImageGalleryProps = {
  coverImage?: ImageMedia;
  images?: ImageMedia[];
};

export default function ImageGallery({ coverImage, images }: ImageGalleryProps) {
  const merged = [coverImage, ...(images ?? [])].filter(Boolean) as ImageMedia[];

  if (merged.length === 0) return null;

  const [first, ...rest] = merged;

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <Image
          src={first.src}
          alt={first.alt}
          {...getImageSize(first)}
          className="h-auto w-full object-cover"
          sizes="(max-width: 768px) 100vw, 960px"
        />
        {first.credit && (
          <p className="px-4 pb-3 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {first.credit}
          </p>
        )}
      </div>

      {rest.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {rest.map((image) => (
            <div
              key={image.src}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <Image
                src={image.src}
                alt={image.alt}
                {...getImageSize(image)}
                className="h-auto w-full object-cover"
                sizes="(max-width: 768px) 100vw, 480px"
              />
              {image.credit && (
                <p className="px-3 pb-3 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {image.credit}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
