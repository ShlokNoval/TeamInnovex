import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'hosea-requisitionary-unawares.ngrok-free.dev',
    '*.ngrok-free.app',
    '*.trycloudflare.com',
    '*.loca.lt'
  ],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8000/api/:path*',
        },
        {
          source: '/socket.io/:path*',
          destination: 'http://localhost:8000/socket.io/:path*',
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'ngrok-skip-browser-warning',
            value: 'true',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
