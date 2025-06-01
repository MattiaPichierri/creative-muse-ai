import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Basic configuration
  reactStrictMode: true,
  // Disable static generation to avoid build issues
  output: 'standalone',
  trailingSlash: false,
};

export default nextConfig;
