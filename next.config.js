/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Webpack config to handle leaflet CSS properly
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
