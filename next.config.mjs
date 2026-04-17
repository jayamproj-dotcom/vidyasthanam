/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/vidyasthanam',
  assetPrefix: '/vidyasthanam/',
  output: 'standalone',
  images: {
    qualities: [25, 50, 75, 85, 100],
  },
}

export default nextConfig;