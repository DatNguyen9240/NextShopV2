import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "res.cloudinary.com",
      "lamia.com.vn",
      "localhost",
      "tse3.mm.bing.net",
      "tse2.mm.bing.net",
      "tse1.mm.bing.net",
      "tse4.mm.bing.net",
      "5.imimg.com",
      "th.bing.com",
      "img.freepik.com",
      // Allow images served from Vecteezy previews used in admin uploads/previews
      "static.vecteezy.com",
      "api.qrserver.com",
      "nonson.vn",
      // Allow Shopee-hosted images used by some merchants
      "down-vn.img.susercontent.com",
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
