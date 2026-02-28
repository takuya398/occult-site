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
  async redirects() {
    return [
      {
        source: "/uma",
        destination: "/entities",
        permanent: true,
      },
      {
        source: "/uma/:slug",
        destination: "/entities/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
