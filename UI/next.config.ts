import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['hosea-requisitionary-unawares.ngrok-free.dev'],
  async rewrites() {
    return {
      beforeFiles: [
        // Proxy WebSocket connections to Flask backend
        {
          source: '/ws/:path*',
          destination: 'http://localhost:8000/ws/:path*'
        },
        {
          source: '/ws',
          destination: 'http://localhost:8000/ws'
        },
        // Proxy Auth API to Flask backend (must come before /api catch-all)
        {
          source: '/api/auth/:path*',
          destination: 'http://localhost:8000/api/auth/:path*'
        },
        // Proxy Backend API calls to Flask
        {
          source: '/api/alerts/:path*',
          destination: 'http://localhost:8000/api/alerts/:path*'
        },
        {
          source: '/api/alerts',
          destination: 'http://localhost:8000/api/alerts'
        },
        {
          source: '/api/analytics',
          destination: 'http://localhost:8000/api/analytics'
        },
        {
          source: '/api/sessions/:path*',
          destination: 'http://localhost:8000/api/sessions/:path*'
        },
        {
          source: '/api/sessions',
          destination: 'http://localhost:8000/api/sessions'
        },
        {
          source: '/api/reports/:path*',
          destination: 'http://localhost:8000/api/reports/:path*'
        }
      ]
    };
  }
};

export default nextConfig;

