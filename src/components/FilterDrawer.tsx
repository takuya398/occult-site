"use client";

import { useEffect, useRef, type ReactNode } from "react";

type FilterDrawerProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onReset?: () => void;
  title?: string;
  children: ReactNode;
};

export default function FilterDrawer({
  open,
  onOpenChange,
  onReset,
  title = "検索・絞り込み",
  children,
}: FilterDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // ESC で閉じる
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // 開いたら閉じるボタンにフォーカス
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  // ボディスクロールをロック
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 sm:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel（左からスライド） */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fixed left-0 top-0 z-50 flex h-full w-[88%] max-w-sm flex-col bg-white shadow-xl transition-transform duration-200 ease-in-out sm:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ヘッダー */}
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-5 py-4">
          <span className="text-sm font-semibold text-zinc-700">{title}</span>
          <button
            ref={closeRef}
            type="button"
            aria-label="フィルターを閉じる"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors active:bg-zinc-100"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* スクロール可能なコンテンツ */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {/* フッター */}
        <div className="flex shrink-0 gap-2 border-t border-zinc-100 bg-white px-4 py-3">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="flex-1 rounded-full border border-zinc-200 py-2.5 text-sm text-zinc-700 transition-colors active:bg-zinc-50"
            >
              リセット
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={`${
              onReset ? "flex-1" : "w-full"
            } rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors active:bg-zinc-700`}
          >
            閉じる
          </button>
        </div>
      </div>
    </>
  );
}
