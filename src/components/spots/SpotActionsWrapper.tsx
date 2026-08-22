"use client";
import { useState, useEffect } from "react";
import SpotActions from "./SpotActions";

export default function SpotActionsWrapper({ slug }: { slug: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="flex flex-wrap items-center justify-between gap-3" aria-hidden="true" />;
  return <SpotActions slug={slug} />;
}
