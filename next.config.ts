import type { NextConfig } from "next";

const useMockData = process.env.USE_MOCK_DATA === 'true';

const nextConfig: NextConfig = {
  /* config options here */
  
  async rewrites() {
    if (useMockData) {
      console.log("Result: Rewriting /api to /mock-api for mock data.");
      return [
        {
          source: '/api/:path*',
          destination: '/mock-api/:path*', 
        },
      ];
    } else {
      console.log("Result: Proxying /api to the external backend.");
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8000/:path*',
        },
      ];
    }
  },
};

export default nextConfig;