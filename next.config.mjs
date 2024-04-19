/**
 * @type {import('next').Config}
 */
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit();

export default withPWA({
  reactStrictMode: true,
  serverRuntimeConfig: {
    runtime: "edge"
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
});