import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig();

// Avoid recursively invoking OpenNext when it builds the Next.js application.
config.buildCommand = "pnpm next:build";

export default config;
