"use client";
import ShareBar from "@/components/article/ShareBar";
import SpotLikeButton from "@/components/spots/SpotLikeButton";

type Props = { slug: string };

export default function SpotActions({ slug }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <ShareBar />
      <SpotLikeButton slug={slug} />
    </div>
  );
}
