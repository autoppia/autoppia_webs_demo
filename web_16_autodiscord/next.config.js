/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const destination =
      process.env.INTERNAL_API_URL ||
      (process.env.NODE_ENV === "development" && !process.env.DOCKER_BUILD
        ? "http://localhost:8090"
        : "http://app:8090");
    return {
      afterFiles: [
        { source: "/api/log-event", destination: `${destination}/save_events/` },
        { source: "/api/:path*", destination: `${destination}/:path*` },
      ],
    };
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com", pathname: "/**" },
    ],
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
