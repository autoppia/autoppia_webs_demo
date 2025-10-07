// Set default environment variables for local development
// For local development (non-Docker), always enable dynamic HTML
// Docker builds will override these values via build args
const isDockerBuild = process.env.DOCKER_BUILD === 'true' || process.env.NODE_ENV === 'production';
const isLocalDev = process.env.NODE_ENV !== 'production' && !process.env.DOCKER_BUILD;

// For local development, always default to true unless explicitly set to false
if (!process.env.ENABLE_DYNAMIC_HTML) {
  process.env.ENABLE_DYNAMIC_HTML = isLocalDev ? 'true' : 'false';
}
// For local development, always force NEXT_PUBLIC_ENABLE_DYNAMIC_HTML to true
if (isLocalDev) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML = 'true';
} else if (!process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML = 'false';
}

console.log('🔍 Next.js config - Environment variables:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  isLocalDev:', isLocalDev);
console.log('  isDockerBuild:', isDockerBuild);
console.log('  API_URL:', process.env.API_URL);
console.log('  ENABLE_DYNAMIC_HTML:', process.env.ENABLE_DYNAMIC_HTML);
console.log('  ENABLE_DATA_GENERATION:', process.env.ENABLE_DATA_GENERATION);
console.log('  NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
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
    ENABLE_DATA_GENERATION: process.env.ENABLE_DATA_GENERATION,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // experimental: {
  //   allowedDevOrigins: ['https://be96-72-255-23-44.ngrok-free.app'], // ← your ngrok public URL
  // },
};

module.exports = nextConfig;
