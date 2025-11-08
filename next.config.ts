import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: { appDir: true } as any
};

module.exports = nextConfig;
