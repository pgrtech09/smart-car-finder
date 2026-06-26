/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: '/smart-car-finder',
  assetPrefix: '/smart-car-finder',
};

module.exports = nextConfig;
