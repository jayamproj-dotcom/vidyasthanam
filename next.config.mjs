/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // <--- Add this line
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  trailingSlash: true,
  images: {
    qualities: [25, 50, 75, 85, 100],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
