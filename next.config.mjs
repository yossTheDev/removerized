/** @type {import('next').Config} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["onnxruntime-web"],
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
