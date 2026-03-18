/** @type {import('next').Config} */
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    runtime: "edge",
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "onnxruntime-node": false,
    }
    return config
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
