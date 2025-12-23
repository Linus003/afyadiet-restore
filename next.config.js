import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Ignore TypeScript Errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // 2. Ignore ESLint Errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 3. (Optional) Keep your existing config if you had any
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
