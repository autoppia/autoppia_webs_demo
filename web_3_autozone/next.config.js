// Set default environment variables (only if not already set)
// This ensures Docker build args are respected
if (!process.env.ENABLE_DYNAMIC_HTML) {
  process.env.ENABLE_DYNAMIC_HTML = 'false';
}
if (!process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML = process.env.ENABLE_DYNAMIC_HTML || 'false';
}

// Debug: Print environment variables
console.log('🔍 Next.js config - Environment variables:');
console.log('  ENABLE_DYNAMIC_HTML:', process.env.ENABLE_DYNAMIC_HTML);
console.log('  NEXT_PUBLIC_ENABLE_DYNAMIC_HTML:', process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML);

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
    ENABLE_DYNAMIC_HTML: process.env.ENABLE_DYNAMIC_HTML || 'true',
    NEXT_PUBLIC_ENABLE_DYNAMIC_HTML: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML || 'true',
  },
  // experimental: {
  //   allowedDevOrigins: ['https://be96-72-255-23-44.ngrok-free.app'], // ← your ngrok public URL
  // },
};

module.exports = nextConfig;
