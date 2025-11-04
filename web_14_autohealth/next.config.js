const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

/** @type {import('next').NextConfig} */
module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  const base = {
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
        { protocol: "https", hostname: "source.unsplash.com", pathname: "/**" },
        { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
        { protocol: "https", hostname: "ext.same-assets.com", pathname: "/**" },
        { protocol: "https", hostname: "ugc.same-assets.com", pathname: "/**" },
      ],
    },
  };

  return {
    ...base,
    env: {
      NEXT_PUBLIC_ENABLE_DYNAMIC_HTML:
        process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML ?? (isDev ? 'true' : undefined),
      ENABLE_DYNAMIC_HTML:
        process.env.ENABLE_DYNAMIC_HTML ?? (isDev ? 'true' : undefined),
      NEXT_PUBLIC_DYNAMIC_HTML_STRUCTURE:
        process.env.NEXT_PUBLIC_DYNAMIC_HTML_STRUCTURE ?? undefined,
    },
  };
};
