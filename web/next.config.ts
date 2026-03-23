import type { NextConfig } from "next";

const deployTarget = process.env.JP_DEPLOY_TARGET === "static" ? "static" : "runtime";

const nextConfig: NextConfig = {
  output: deployTarget === "static" ? "export" : "standalone",
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
