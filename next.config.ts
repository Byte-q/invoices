import type { NextConfig } from 'next';
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
};

// Make sure adding Sentry options is the last code to run before exporting
export default withSentryConfig(nextConfig, {
  reactComponentAnnotation: {
    enabled: true,
  },
  automaticVercelMonitors: true,
  org: "simplixin",
  project: "invoicing-and-accounting",

  // Pass the auth token
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,
  // Only print logs for uploading source maps in CI
  // Set to `true` to suppress logs
  silent: !process.env.CI,
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  tunnelRoute: true,
});

// export default nextConfig;
