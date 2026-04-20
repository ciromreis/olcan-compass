import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@payloadcms/next"],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "substack.com" },
      { protocol: "https", hostname: "substackcdn.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/login',
        has: [{ type: 'host', value: 'app.olcan.com.br' }],
        destination: 'https://compass.olcan.com.br/login',
        permanent: false,
      },
      {
        source: '/register',
        has: [{ type: 'host', value: 'app.olcan.com.br' }],
        destination: 'https://compass.olcan.com.br/register',
        permanent: false,
      },
      {
        source: '/dashboard/:path*',
        has: [{ type: 'host', value: 'app.olcan.com.br' }],
        destination: 'https://compass.olcan.com.br/dashboard/:path*',
        permanent: false,
      },
      {
        source: '/onboarding/:path*',
        has: [{ type: 'host', value: 'app.olcan.com.br' }],
        destination: 'https://compass.olcan.com.br/onboarding/:path*',
        permanent: false,
      },
    ];
  },
};

export default withPayload(nextConfig);
