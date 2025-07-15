/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  images: {
    unoptimized: true, // To fix hydration crossorigin issues
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ext.same-assets.com',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // experimental: {
  //   allowedDevOrigins: ['https://be96-72-255-23-44.ngrok-free.app'], // ← your ngrok public URL
  // },
};

module.exports = nextConfig;
