import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the tracing root to this project so an unrelated lockfile in a parent
  // directory doesn't confuse Next's workspace-root inference.
  outputFileTracingRoot: __dirname,
  images: {
    // Placeholder art ships as SVG; allow it and skip the optimizer so the
    // app builds and runs anywhere (including Railway) with zero image deps.
    dangerouslyAllowSVG: true,
    unoptimized: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
