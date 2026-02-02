"use client";

import { normalizeMedia } from "@/lib/media";

type EmbedMediaProps = {
  url: string;
  title?: string;
};

export default function EmbedMedia({ url, title }: EmbedMediaProps) {
  if (!url) return null;
  const media = normalizeMedia(url);

  if (media.kind === "youtube" && media.embedUrl) {
    return (
      <div className="space-y-3">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-100 dark:bg-zinc-900">
          <iframe
            src={media.embedUrl}
            title={title ?? "YouTube"}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <a
          href={media.externalUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center text-sm text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
        >
          YouTubeで見る
        </a>
      </div>
    );
  }

  if (media.kind === "tiktok") {
    return (
      <div className="space-y-3">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-100 dark:bg-zinc-900">
          <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
            TikTokは外部で再生します
          </div>
        </div>
        <a
          href={media.externalUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center text-sm text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
        >
          TikTokで見る
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-100 dark:bg-zinc-900">
        <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
          埋め込みに対応していないURLです
        </div>
      </div>
      <a
        href={media.externalUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center text-sm text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
      >
        外部で開く
      </a>
    </div>
  );
}
