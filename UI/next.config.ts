import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['hosea-requisitionary-unawares.ngrok-free.dev'],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/ws/:path*',
          destination: 'http://localhost:8000/ws/:path*'
        },
        {
          source: '/ws',
          destination: 'http://localhost:8000/ws'
        }
      ]
    };
  }
};

export default nextConfig;
