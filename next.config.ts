import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lamia.com.vn', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      { protocol: 'https', hostname: '*.mm.bing.net', pathname: '/**' },
      { protocol: 'https', hostname: '5.imimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'th.bing.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.freepik.com', pathname: '/**' },
      { protocol: 'https', hostname: 'static.vecteezy.com', pathname: '/**' },
      { protocol: 'https', hostname: 'api.qrserver.com', pathname: '/**' },
      { protocol: 'https', hostname: 'nonson.vn', pathname: '/**' },
      { protocol: 'https', hostname: 'down-vn.img.susercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'example.com', pathname: '/**' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/_next/src/:path*',
        destination: '/empty.js.map',
      },
      {
        source: '/src/lib/:path*',
        destination: '/empty.js.map',
      },
    ];
  },
};

export default nextConfig;
