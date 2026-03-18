/** @type {import('next').Config} */
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    runtime: "edge",
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
}

export default nextConfig
