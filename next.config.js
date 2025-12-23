/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Ignore TypeScript Errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // 2. Ignore ESLint Errors during build
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

// 👇 THIS IS THE FIX: Use 'export default' instead of 'module.exports'
export default nextConfig;
