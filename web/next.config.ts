import type { NextConfig } from "next";

const deployTarget = process.env.JP_DEPLOY_TARGET === "static" ? "static" : "runtime";
const assetBaseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL;
const assetRemotePattern = assetBaseUrl
  ? (() => {
      const url = new URL(assetBaseUrl);
      return {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        pathname: "/**",
      };
    })()
  : null;

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
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
        pathname: "/**",
      },
      ...(assetRemotePattern ? [assetRemotePattern] : []),
    ],
  },
};

export default nextConfig;
