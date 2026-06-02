import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackUseSystemTlsCerts: true,
    nodeMiddleware: true,
  },
  images: {
    // 外部画像を使う場合はここにドメインを追加してください
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
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
