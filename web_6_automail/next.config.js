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

// Handle ENABLE_DYNAMIC_HTML_STRUCTURE (separate from layout control)
if (!process.env.ENABLE_DYNAMIC_HTML_STRUCTURE) {
  process.env.ENABLE_DYNAMIC_HTML_STRUCTURE = isLocalDev ? 'true' : 'false';
}
if (isLocalDev) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE = 'true';
} else if (!process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE = 'false';
}

// Debug: Print environment variables
console.log('🔍 Next.js config - Environment variables:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  DOCKER_BUILD:', process.env.DOCKER_BUILD);
console.log('  isLocalDev:', isLocalDev);
console.log('  isDockerBuild:', isDockerBuild);
console.log('  ENABLE_DYNAMIC_HTML:', process.env.ENABLE_DYNAMIC_HTML);
console.log('  NEXT_PUBLIC_ENABLE_DYNAMIC_HTML:', process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML);
console.log('  ENABLE_DYNAMIC_HTML_STRUCTURE:', process.env.ENABLE_DYNAMIC_HTML_STRUCTURE);
console.log('  NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE:', process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE);

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
    ENABLE_DYNAMIC_HTML: process.env.ENABLE_DYNAMIC_HTML,
    NEXT_PUBLIC_ENABLE_DYNAMIC_HTML: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML,
    ENABLE_DYNAMIC_HTML_STRUCTURE: process.env.ENABLE_DYNAMIC_HTML_STRUCTURE,
    NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE,
  },
};

module.exports = nextConfig;
