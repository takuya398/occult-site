import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 外部画像を使う場合はここにドメインを追加してください
    // remotePatterns: [{ protocol: "https", hostname: "example.com" }],
  },
};

export default nextConfig;
