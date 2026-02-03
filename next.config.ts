import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 外部画像を使う場合はここにドメインを追加してください
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
