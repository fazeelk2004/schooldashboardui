/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.pexels.com" },
      { hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [
      "pdf-parse",
      "pdfjs-dist",
      "mammoth",
      "jszip",
      "fast-xml-parser",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Force these packages to be loaded natively by Node, not bundled
      const nodeExternals = ["pdf-parse", "pdfjs-dist"];
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        ...nodeExternals,
      ];
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;

