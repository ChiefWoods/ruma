import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals['@solana/web3.js'] = 'commonjs @solana/web3.js';
    config.externals['@solana/spl-token'] = 'commonjs @solana/spl-token';
    config.externals['@solana/kit'] = 'commonjs @solana/kit';

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '*.mypinata.cloud',
        port: '',
      },
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
