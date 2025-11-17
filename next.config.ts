/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Allow warnings during build but fail on errors
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Enforce TypeScript checking
  typescript: {
    ignoreBuildErrors: false,
  },

  // Optimize package imports
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;
