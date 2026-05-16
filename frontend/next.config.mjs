/** @type {import('next').NextConfig} */
const GATEWAY = process.env.GATEWAY_URL || 'http://192.168.49.2:30065';

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
