/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      // Add any other external image sources you need here, for example:
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   port: '',
      //   pathname: '/images/**',
      // },
    ],
    // Optional: Set a default image loader
    // loader: 'default',
  },
  // Enable experimental features if needed
  experimental: {
    // appDir: true, // Enable this if you're using the new app directory structure
    // serverActions: true, // Enable server actions
  },
  // Redirects and rewrites if needed
  async redirects() {
    return [
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },
  async rewrites() {
    return [
      // {
      //   source: '/api/:path*',
      //   destination: 'https://api.example.com/:path*',
      // },
    ];
  },
  // Environment variables that should be exposed to the client
  env: {
    // NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Webpack configuration if needed
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    return config;
  },
  // Enable output standalone build
  output: "standalone",
};

export default nextConfig;
