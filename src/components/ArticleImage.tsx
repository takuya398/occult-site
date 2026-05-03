"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  fallbackClassName?: string;
};

export default function ArticleImage({
  src,
  alt,
  sizes = "(max-width: 640px) 50vw, 33vw",
  className = "object-cover transition-transform duration-300 group-hover:scale-105",
  priority = false,
  fallbackClassName = "flex h-full w-full items-center justify-center text-3xl opacity-20 select-none",
}: Props) {
  const [error, setError] = useState(false);

  if (error) {
    return <div className={fallbackClassName}>👻</div>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
