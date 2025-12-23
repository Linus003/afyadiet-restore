/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Ignore TypeScript Errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // 2. Ignore ESLint Errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 3. Keep your server actions limit
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
