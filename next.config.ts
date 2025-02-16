import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.edgestore.dev",
      },
    ],
    domains: ['assets.zyrosite.com', 'img.freepik.com'], // Add this domain
  },
};

export default nextConfig;
