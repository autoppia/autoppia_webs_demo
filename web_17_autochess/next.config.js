// Set default environment variables for local development
const isDockerBuild = process.env.DOCKER_BUILD === 'true' || process.env.NODE_ENV === 'production';
const isLocalDev = process.env.NODE_ENV !== 'production' && !process.env.DOCKER_BUILD;

if (!process.env.ENABLE_DYNAMIC_V1) {
  process.env.ENABLE_DYNAMIC_V1 = isLocalDev ? 'true' : 'false';
}
if (isLocalDev) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 = 'true';
} else if (!process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 = 'false';
}

if (!process.env.ENABLE_DYNAMIC_V3) {
  process.env.ENABLE_DYNAMIC_V3 = isLocalDev ? 'true' : 'false';
}
if (isLocalDev) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 = 'true';
} else if (!process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 = 'false';
}

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
  async rewrites() {
    const destination = process.env.INTERNAL_API_URL ||
      (process.env.NODE_ENV === 'development' && !process.env.DOCKER_BUILD
        ? 'http://localhost:8090'
        : 'http://app:8090');

    return [
      {
        source: '/api/log-event',
        destination: `${destination}/save_events/`,
      },
      {
        source: '/api/:path*',
        destination: `${destination}/:path*`,
      },
    ];
  },

  reactStrictMode: false,
  devIndicators: false,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
