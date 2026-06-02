"use client";

import { useState, useEffect } from "react";
import { getUserKey } from "@/lib/userKey";

type Props = {
  targetType: "experience" | "comment";
  targetId: string;
  initialCount: number;
  storageKey: string;
};

export default function LikeButton({ targetType, targetId, initialCount, storageKey }: Props) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("_exp_liked") ?? "[]";
    const ids: string[] = JSON.parse(raw);
    setLiked(ids.includes(storageKey));
  }, [storageKey]);

  async function handleClick() {
    if (liked || loading) return;
    setLoading(true);

    const guestKey = getUserKey();
    const res = await fetch("/api/experience-reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_type: targetType, target_id: targetId, guest_key: guestKey }),
    });

    const data = await res.json();
    if (data.duplicate) {
      setLiked(true);
    } else if (data.ok) {
      setCount(data.like_count ?? count + 1);
      setLiked(true);
      const raw = localStorage.getItem("_exp_liked") ?? "[]";
      const ids: string[] = JSON.parse(raw);
      ids.push(storageKey);
      localStorage.setItem("_exp_liked", JSON.stringify(ids));
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={liked || loading}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
        liked
          ? "border-purple-400/50 bg-purple-900/30 text-purple-300 cursor-default"
          : "border-zinc-600 bg-transparent text-zinc-400 hover:border-purple-500 hover:text-purple-400 cursor-pointer"
      }`}
      aria-label="怖かった"
    >
      👻 怖かった {count}
    </button>
  );
}
