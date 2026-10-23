/** @type {import('next').NextConfig} */
const nextConfig = {
  // Preserve the incoming origin for tenant rewrites, including local IP hosts.
  skipMiddlewareUrlNormalize: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  eslint: {
    // Design/marketing site — don't let lint block production builds.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
