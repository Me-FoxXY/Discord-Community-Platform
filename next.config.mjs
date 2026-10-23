/** @type {import('next').NextConfig} */
const nextConfig = {
  // Isolate optional preview builds from a running development server.
  distDir: process.env.NEXT_BUILD_DIR || ".next",
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
