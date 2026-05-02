"use client";

import { useEffect } from "react";

type Props = {
  slug: string;
  articleType?: string;
};

export default function ViewTracker({ slug, articleType = "spots" }: Props) {
  useEffect(() => {
    fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, articleType }),
    }).catch(() => {});
  }, [slug, articleType]);

  return null;
}
