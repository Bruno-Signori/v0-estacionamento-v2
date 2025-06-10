/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Resolve fallbacks for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
      }
    }

    // Ignore problematic modules
    config.externals = config.externals || []
    config.externals.push({
      "qz-tray": "qz-tray",
      "node:crypto": "crypto",
      "node:buffer": "buffer",
    })

    return config
  },
}

module.exports = nextConfig
