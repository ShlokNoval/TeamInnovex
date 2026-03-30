import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use a more robust list of allowed origins for development
  allowedDevOrigins: [
    'localhost:3000', 
    '127.0.0.1:3000', 
    'hosea-requisitionary-unawares.ngrok-free.dev',
    '*.ngrok-free.dev',
    'ngrok-free.dev'
  ],
  async rewrites() {
    return {
      beforeFiles: [
        // Standard Socket.IO path proxy (catches /socket.io/, /socket.io/1/, etc.)
        {
          source: '/socket.io/:path*',
          destination: 'http://localhost:8000/socket.io/:path*'
        },
        // Root /socket.io catch (matches requests without trailing slash)
        {
          source: '/socket.io',
          destination: 'http://localhost:8000/socket.io/'
        },
        // Proxy Auth API to Flask backend
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
