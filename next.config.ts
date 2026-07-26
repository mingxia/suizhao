import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Keep the first paint from racing the global stylesheet on slower networks.
  // The application has one small, global stylesheet, so including it in the
  // initial HTML is preferable to briefly rendering the document unstyled.
  experimental: {
    inlineCss: true,
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
