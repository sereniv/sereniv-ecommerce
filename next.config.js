const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '',
  publicRuntimeConfig: {
    basePath: '',
  },
  // Enhanced image optimization
  images: {
    domains: [
      'images.unsplash.com', 
      'droomdroom.com',
      'bucket.droomdroom.online',
      'eventbucket.bucket.droomdroom.online',
      'res.cloudinary.com',
      'images.pexels.com',
      'cryptorank.io',
      'img.cryptorank.io',
      '*'
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
}

module.exports = withBundleAnalyzer(nextConfig) 