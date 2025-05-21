/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    if (isServer) {
      config.externals = [...config.externals, 'sharp'];
    }
    return config;
  },
}

export default nextConfig
