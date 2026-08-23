/** @type {import('next').NextConfig} */
const GATEWAY = process.env.GATEWAY_URL || 'http://api-gateway:8765';

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/proxy/:path*',
        destination: `${GATEWAY}/:path*`,
      },
    ];
  },
  output: 'standalone',
};

export default nextConfig;
