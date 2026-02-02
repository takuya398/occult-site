"use client";

import { useEffect, useRef, useState } from "react";
import type { EmbedMedia } from "@/types";

const getYouTubeId = (url: string) => {
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
  return match?.[1];
};

const getTikTokId = (url: string) => {
  const match = url.match(/video\/(\d+)/);
  return match?.[1];
};

type EmbedsProps = {
  embeds?: EmbedMedia[];
};

type TikTokEmbedProps = {
  url: string;
  title?: string;
};

function TikTokEmbed({ url, title }: TikTokEmbedProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const videoId = getTikTokId(url);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {visible && videoId ? (
        <iframe
          src={`https://www.tiktok.com/embed/v2/${videoId}`}
          title={title ?? "TikTok"}
          className="h-[520px] w-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      ) : (
        <div className="flex h-[520px] items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
          TikTokを読み込み中...
        </div>
      )}
    </div>
  );
}

export default function Embeds({ embeds }: EmbedsProps) {
  if (!embeds || embeds.length === 0) return null;

  return (
    <section className="space-y-4">
      {embeds.map((embed, index) => {
        if (embed.type === "youtube") {
          const id = getYouTubeId(embed.url);
          if (!id) return null;
          return (
            <div
              key={`${embed.type}-${index}`}
              className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <iframe
                src={`https://www.youtube.com/embed/${id}`}
                title={embed.title ?? "YouTube"}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }

        if (embed.type === "tiktok") {
          return (
            <TikTokEmbed
              key={`${embed.type}-${index}`}
              url={embed.url}
              title={embed.title}
            />
          );
        }

        return null;
      })}
    </section>
  );
}
