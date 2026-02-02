import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 外部画像を使う場合はここにドメインを追加してください
    remotePatterns: [{ protocol: "https", hostname: "placehold.co" }],
  },
};

export default nextConfig;
