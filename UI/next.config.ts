import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*'],
  async rewrites() {
    return {
      beforeFiles: [
        // Proxy REST API calls to the Node.js backend
        {
          source: '/api/:path*',
          destination: 'http://localhost:8000/api/:path*',
        },
        // Proxy Socket.io to the Node.js backend
        {
          source: '/socket.io/:path*',
          destination: 'http://localhost:8000/socket.io/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
