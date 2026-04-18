import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: ".next",
  transpilePackages: ["styled-jsx"],
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Ignore canvas for pdfjs-dist
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    // Ignore node-specific modules in client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        canvas: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
