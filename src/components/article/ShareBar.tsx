"use client";

import { useState } from "react";

export default function ShareBar() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-100"
      >
        リンクをコピー
      </button>
      {copied && (
        <span className="text-xs text-emerald-600 dark:text-emerald-300">
          コピーしました
        </span>
      )}
    </div>
  );
}
