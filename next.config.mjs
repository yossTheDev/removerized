/** @type {import('next').Config} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: "loose",
  },
  serverRuntimeConfig: {
    runtime: "edge",
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "onnxruntime-node": false,
    }
    config.module.noParse = /node_modules\/onnxruntime-web\/dist\/ort.min.js/
    return config
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
}

export default nextConfig
