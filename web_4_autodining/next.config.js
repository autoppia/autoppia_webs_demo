// Set default environment variables for local development
const isDockerBuild = process.env.DOCKER_BUILD === 'true' || process.env.NODE_ENV === 'production';
const isLocalDev = process.env.NODE_ENV !== 'production' && !process.env.DOCKER_BUILD;

// Handle ENABLE_DYNAMIC_HTML_STRUCTURE
if (!process.env.ENABLE_DYNAMIC_HTML_STRUCTURE) {
  process.env.ENABLE_DYNAMIC_HTML_STRUCTURE = isLocalDev ? 'true' : 'false';
}
if (isLocalDev) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE = 'true';
} else if (!process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE = 'false';
}

// Debug: Print environment variables
console.log('🔍 AutoDining - Environment variables:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  DOCKER_BUILD:', process.env.DOCKER_BUILD);
console.log('  isLocalDev:', isLocalDev);
console.log('  isDockerBuild:', isDockerBuild);
console.log('  ENABLE_DYNAMIC_HTML_STRUCTURE:', process.env.ENABLE_DYNAMIC_HTML_STRUCTURE);
console.log('  NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE:', process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE);
console.log('  ENABLE_DATA_GENERATION:', process.env.ENABLE_DATA_GENERATION);
console.log('  NEXT_PUBLIC_DATA_GENERATION:', process.env.NEXT_PUBLIC_DATA_GENERATION);
console.log('  NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('  DATA_SEED_VALUE:', process.env.DATA_SEED_VALUE);
console.log('  NEXT_PUBLIC_DATA_SEED_VALUE:', process.env.NEXT_PUBLIC_DATA_SEED_VALUE);
console.log('  ENABLE_DB_MODE:', process.env.ENABLE_DB_MODE);
console.log('  NEXT_PUBLIC_ENABLE_DB_MODE:', process.env.NEXT_PUBLIC_ENABLE_DB_MODE);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  devIndicators: false,
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
  env: {
    ENABLE_DYNAMIC_HTML: process.env.ENABLE_DYNAMIC_HTML,
    NEXT_PUBLIC_ENABLE_DYNAMIC_HTML: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML,
    ENABLE_DYNAMIC_HTML_STRUCTURE: process.env.ENABLE_DYNAMIC_HTML_STRUCTURE,
    NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE,
    ENABLE_DATA_GENERATION: process.env.ENABLE_DATA_GENERATION,
    NEXT_PUBLIC_DATA_GENERATION: process.env.NEXT_PUBLIC_DATA_GENERATION,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    DATA_SEED_VALUE: process.env.DATA_SEED_VALUE,
    NEXT_PUBLIC_DATA_SEED_VALUE: process.env.NEXT_PUBLIC_DATA_SEED_VALUE,
    ENABLE_DB_MODE: process.env.ENABLE_DB_MODE,
    NEXT_PUBLIC_ENABLE_DB_MODE: process.env.NEXT_PUBLIC_ENABLE_DB_MODE,
  },
};

module.exports = nextConfig;
