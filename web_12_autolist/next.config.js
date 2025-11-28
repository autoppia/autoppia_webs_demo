// Set default environment variables for local development
// For local development (non-Docker), always enable dynamic HTML
// Docker builds will override these values via build args
const isDockerBuild = process.env.DOCKER_BUILD === 'true' || process.env.NODE_ENV === 'production';
const isLocalDev = process.env.NODE_ENV !== 'production' && !process.env.DOCKER_BUILD;

// For local development, set defaults; Docker overrides
if (!process.env.ENABLE_DYNAMIC_V1) {
  process.env.ENABLE_DYNAMIC_V1 = isLocalDev ? 'true' : 'false';
}
if (isLocalDev) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 = 'true';
} else if (!process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 = 'false';
}
// Dynamic HTML structure flag (controls seed-based structure)
if (!process.env.DYNAMIC_HTML_STRUCTURE) {
  process.env.DYNAMIC_HTML_STRUCTURE = 'false';
}
if (!process.env.NEXT_PUBLIC_DYNAMIC_HTML_STRUCTURE) {
  process.env.NEXT_PUBLIC_DYNAMIC_HTML_STRUCTURE = process.env.DYNAMIC_HTML_STRUCTURE;
}

// Debug: Print environment variables
console.log('🔍 Next.js config - Environment variables:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  DOCKER_BUILD:', process.env.DOCKER_BUILD);
console.log('  isLocalDev:', isLocalDev);
console.log('  isDockerBuild:', isDockerBuild);
console.log('  ENABLE_DYNAMIC_V1:', process.env.ENABLE_DYNAMIC_V1);
console.log('  NEXT_PUBLIC_ENABLE_DYNAMIC_V1:', process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1);
console.log('  DYNAMIC_HTML_STRUCTURE:', process.env.DYNAMIC_HTML_STRUCTURE);
console.log('  NEXT_PUBLIC_DYNAMIC_HTML_STRUCTURE:', process.env.NEXT_PUBLIC_DYNAMIC_HTML_STRUCTURE);

/** @type {import('next').NextConfig} */
const nextConfig = {
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
