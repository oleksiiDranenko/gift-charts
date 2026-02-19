import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "markmind-editor",
    "notion-design-system",
    "niva-ui",
    "lucide-react",
    "@headlessui/react",
  ],
  images: {
    formats: ["image/webp"],
    minimumCacheTTL: 31536000,
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "images.giftcharts.com",
        pathname: "/gifts/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/cdn-assets/:path*",
        destination: "https://images.giftcharts.com/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:all*(.webp|.png|.jpg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
