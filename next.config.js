/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp'], // Prefer WebP
    minimumCacheTTL: 31536000, // 1 year caching for optimized images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow external images if needed
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:all*(.webp|.png|.jpg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;