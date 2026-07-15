"use client";
import { useState, useEffect } from "react";
import SpotActions from "./SpotActions";

export default function SpotActionsWrapper({ slug }: { slug: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <SpotActions slug={slug} />;
}
