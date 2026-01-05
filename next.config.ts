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
    ],
  },
};

export default nextConfig;
