import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  reactCompiler: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jacopopeca.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
