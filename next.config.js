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
  experimental: {
    serverComponentsExternalPackages: ["@supabase/supabase-js"],
  },
  transpilePackages: ["@supabase/supabase-js"],
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false, crypto: false }
    return config
  },
}

module.exports = nextConfig
