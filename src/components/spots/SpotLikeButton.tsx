"use client";
import { useState, useEffect } from "react";
import { getUserKey } from "@/lib/userKey";

const STORAGE_KEY = "_spot_liked";

function getLikedSlugs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveLikedSlug(slug: string): void {
  try {
    const ids = getLikedSlugs();
    if (!ids.includes(slug)) {
      ids.push(slug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }
  } catch {
    // localStorage が使えない環境では無視
  }
}

type Props = { slug: string };

export default function SpotLikeButton({ slug }: Props) {
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLiked(getLikedSlugs().includes(slug));
    fetch(`/api/spot-likes?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d: { count?: number }) => setCount(d.count ?? 0))
      .catch(() => setCount(0));
  }, [slug]);

  async function handleClick() {
    if (liked || loading) return;
    setLoading(true);

    const guestKey = getUserKey();
    const res = await fetch("/api/spot-likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, guest_key: guestKey }),
    });

    const data = (await res.json()) as {
      ok?: boolean;
      duplicate?: boolean;
      count?: number;
    };

    if (data.duplicate) {
      setLiked(true);
      saveLikedSlug(slug);
    } else if (data.ok) {
      setCount(data.count ?? (count ?? 0) + 1);
      setLiked(true);
      saveLikedSlug(slug);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={liked || loading}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        liked
          ? "border-red-400/50 bg-red-900/20 text-red-300 cursor-default"
          : "border-zinc-600 bg-transparent text-zinc-400 hover:border-red-400 hover:text-red-400 cursor-pointer"
      }`}
      aria-label="いいね"
    >
      <span>{liked ? "❤️" : "🤍"}</span>
      <span>いいね</span>
      {count !== null && (
        <span className="tabular-nums text-xs">{count}</span>
      )}
    </button>
  );
}
