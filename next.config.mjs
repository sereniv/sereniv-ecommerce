/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '',
  publicRuntimeConfig: {
    basePath: '',
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bucket.droomdroom.online',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'eventbucket.bucket.droomdroom.online',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
