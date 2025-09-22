/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['photo.stephanegelibert.com'],
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${process.env.NEXT_PUBLIC_API_BASE}/api/:path*` },
      { source: '/i/:id', destination: `${process.env.NEXT_PUBLIC_API_BASE}/api/img/:id` },
    ];
  },
};
export default nextConfig;
