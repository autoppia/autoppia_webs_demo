// Set default environment variables for local development similar to web_3_autozone
const isDockerBuild = process.env.DOCKER_BUILD === 'true' || process.env.NODE_ENV === 'production';
const isLocalDev = process.env.NODE_ENV !== 'production' && !process.env.DOCKER_BUILD;

if (!process.env.ENABLE_DYNAMIC_HTML_STRUCTURE) {
  process.env.ENABLE_DYNAMIC_HTML_STRUCTURE = isLocalDev ? 'true' : 'false';
}
if (isLocalDev) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE = 'true';
} else if (!process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE = 'false';
}

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ENABLE_DYNAMIC_HTML_STRUCTURE: process.env.ENABLE_DYNAMIC_HTML_STRUCTURE,
    NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE,
  },
};

module.exports = nextConfig;
