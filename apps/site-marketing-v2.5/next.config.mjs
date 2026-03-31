/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "substack.com" },
      { protocol: "https", hostname: "substackcdn.com" },
    ],
  },
};

export default nextConfig;
