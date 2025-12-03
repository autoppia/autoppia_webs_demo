// Set default environment variables for local development similar to web_3_autozone
const isDockerBuild = process.env.DOCKER_BUILD === 'true' || process.env.NODE_ENV === 'production';
const isLocalDev = process.env.NODE_ENV !== 'production' && !process.env.DOCKER_BUILD;

if (!process.env.ENABLE_DYNAMIC_V1_STRUCTURE) {
  process.env.ENABLE_DYNAMIC_V1_STRUCTURE = isLocalDev ? 'true' : 'false';
}
if (isLocalDev) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1_STRUCTURE = 'true';
} else if (!process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1_STRUCTURE) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1_STRUCTURE = 'false';
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    unoptimized: true,
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
      "randomuser.me",
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
      {
        protocol: "https",
        hostname: "randomuser.me",
        pathname: "/**",
      },
    ],
  },
  env: {
    ENABLE_DYNAMIC_V1: process.env.ENABLE_DYNAMIC_V1,
    NEXT_PUBLIC_ENABLE_DYNAMIC_V1: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1,
    ENABLE_DYNAMIC_V2_AI_GENERATE: process.env.ENABLE_DYNAMIC_V2_AI_GENERATE,
    NEXT_PUBLIC_ENABLE_DYNAMIC_V2_AI_GENERATE: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_AI_GENERATE,
    ENABLE_DYNAMIC_V2_DB_MODE: process.env.ENABLE_DYNAMIC_V2_DB_MODE,
    NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE,
    ENABLE_DYNAMIC_V3: process.env.ENABLE_DYNAMIC_V3,
    NEXT_PUBLIC_ENABLE_DYNAMIC_V3: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3,
    ENABLE_DYNAMIC_V4: process.env.ENABLE_DYNAMIC_V4,
    NEXT_PUBLIC_ENABLE_DYNAMIC_V4: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V4,
  },
};

module.exports = nextConfig;
