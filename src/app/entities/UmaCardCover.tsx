"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  slug: string;
  coverSrc?: string;
  isNew?: boolean;
  isDanger5?: boolean;
};

export default function UmaCardCover({ slug, coverSrc, isNew, isDanger5 }: Props) {
  const [error, setError] = useState(false);
  const src = coverSrc ?? "";

  return (
    <figure className="-mx-5 -mt-5 mb-3">
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100">
        {!error ? (
          <>
            <Image
              src={src}
              alt={`${slug} cover`}
              fill
              className={
                "object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" +
                (isDanger5 ? " brightness-[0.90] contrast-[1.06] saturate-[0.90] hue-rotate-[2deg]" : "")
              }
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={() => setError(true)}
            />
            <div
              className={
                isDanger5
                  ? "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/0"
                  : "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-black/0"
              }
            />
            {isDanger5 && (
              <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay uma-noise" />
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-50 to-green-100 text-green-800">
            <div className="text-center">
              <div className="text-sm font-semibold">UMA</div>
              <div className="text-xs opacity-80">画像準備中</div>
            </div>
          </div>
        )}
        {isNew && (
          <span
            className={
              "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm" +
              (isDanger5 ? " bg-green-700/80" : " bg-green-600/90")
            }
          >
            新着
          </span>
        )}
      </div>
    </figure>
  );
}
