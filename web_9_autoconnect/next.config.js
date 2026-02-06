// Set default environment variables for local development
// For local development (non-Docker), always enable dynamic HTML
// Docker builds will override these values via build args
const isDockerBuild = process.env.DOCKER_BUILD === 'true' || process.env.NODE_ENV === 'production';
const isLocalDev = process.env.NODE_ENV !== 'production' && !process.env.DOCKER_BUILD;

// For local development, always default to true unless explicitly set to false
if (!process.env.ENABLE_DYNAMIC_V1) {
  process.env.ENABLE_DYNAMIC_V1 = isLocalDev ? 'true' : 'false';
}
// For local development, always force NEXT_PUBLIC_ENABLE_DYNAMIC_V1 to true
if (isLocalDev) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 = 'true';
} else if (!process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 = 'false';
}

// Mirror V1 behavior for V3 so the dynamic variants stay active locally
if (!process.env.ENABLE_DYNAMIC_V3) {
  process.env.ENABLE_DYNAMIC_V3 = isLocalDev ? 'true' : 'false';
}
if (isLocalDev) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 = 'true';
} else if (!process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 = 'false';
}

console.log('🔍 Next.js config - Environment variables:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  isLocalDev:', isLocalDev);
console.log('  isDockerBuild:', isDockerBuild);
console.log('  API_URL:', process.env.API_URL);
console.log('  ENABLE_DYNAMIC_V1:', process.env.ENABLE_DYNAMIC_V1);
console.log('  ENABLE_DATA_GENERATION:', process.env.ENABLE_DYNAMIC_V2_AI_GENERATE);
console.log('  NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('  ENABLE_DYNAMIC_V3:', process.env.ENABLE_DYNAMIC_V3);
console.log('  NEXT_PUBLIC_ENABLE_DYNAMIC_V3:', process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3);

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

  devIndicators: false,
  images: {
    unoptimized: true,
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
      "randomuser.me",
      "logo.clearbit.com",
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
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
        pathname: "/**",
      },
    ],
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
