// Set default environment variables for local development
const isDockerBuild = process.env.DOCKER_BUILD === "true" || process.env.NODE_ENV === "production";
const isLocalDev = process.env.NODE_ENV !== "production" && !process.env.DOCKER_BUILD;

if (!process.env.ENABLE_DYNAMIC_V1) {
  process.env.ENABLE_DYNAMIC_V1 = isLocalDev ? "true" : "false";
}
if (isLocalDev) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 = "true";
} else if (!process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 = "false";
}

if (!process.env.ENABLE_DYNAMIC_V3) {
  process.env.ENABLE_DYNAMIC_V3 = isLocalDev ? "true" : "false";
}
if (isLocalDev) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 = "true";
} else if (!process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 = "false";
}

console.log("🔍 Next.js config - Environment variables:");
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log("  isLocalDev:", isLocalDev);
console.log("  isDockerBuild:", isDockerBuild);
console.log("  ENABLE_DYNAMIC_V1:", process.env.ENABLE_DYNAMIC_V1);
console.log("  NEXT_PUBLIC_ENABLE_DYNAMIC_V1:", process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1);
console.log("  ENABLE_DYNAMIC_V3:", process.env.ENABLE_DYNAMIC_V3);
console.log("  NEXT_PUBLIC_ENABLE_DYNAMIC_V3:", process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3);

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const destination = process.env.INTERNAL_API_URL || 
      (process.env.NODE_ENV === 'development' && !process.env.DOCKER_BUILD 
        ? 'http://localhost:8090' 
        : 'http://app:8090');
    
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/api/log-event',
          destination: `${destination}/save_events/`,
        },
        {
          source: '/api/:path*',
          destination: `${destination}/:path*`,
        },
      ],
      fallback: [],
    };
  },

  allowedDevOrigins: ["*.preview.same-app.com"],
  images: {
    unoptimized: true,
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
    ],
  },
  env: {
    ENABLE_DYNAMIC_V1: process.env.ENABLE_DYNAMIC_V1,
    NEXT_PUBLIC_ENABLE_DYNAMIC_V1: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1,
    ENABLE_DYNAMIC_V2: process.env.ENABLE_DYNAMIC_V2,
    NEXT_PUBLIC_ENABLE_DYNAMIC_V2: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2,
    ENABLE_DYNAMIC_V3: process.env.ENABLE_DYNAMIC_V3,
    NEXT_PUBLIC_ENABLE_DYNAMIC_V3: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3,
    ENABLE_DYNAMIC_V4: process.env.ENABLE_DYNAMIC_V4,
    NEXT_PUBLIC_ENABLE_DYNAMIC_V4: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V4,
  },
};

module.exports = nextConfig;
