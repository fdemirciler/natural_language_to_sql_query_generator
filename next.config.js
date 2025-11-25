/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: process.env.NODE_ENV === 'development' ? undefined : 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true
};

module.exports = nextConfig;
