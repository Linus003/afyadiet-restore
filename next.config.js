/** @type {import('next').NextConfig} */
const nextConfig = {
  // FIX 1: 'server' is unrecognized in modern Next.js configs. 
  // We must set the trustProxy directly under the experimental flag if available,
  // or rely solely on the Cloudflare setup, as the standard 'server' key is deprecated.
  // We are removing the invalid 'server' key to pass the initial config check.
  
  // Note: We are now solely relying on the Cloudflare Origin Rule or environment 
  // variables for Host Header trust, as this config key is invalid.
};

export default nextConfig;
