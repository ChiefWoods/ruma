import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@coral-xyz/anchor'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'arweave.net',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'gateway.irys.xyz',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
      },
    ],
  },
};

export default nextConfig;
