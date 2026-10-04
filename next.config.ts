import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Single-page Tailwind site: inlining the small stylesheet removes a render-blocking request.
    inlineCss: true,
  },
};

export default nextConfig;
