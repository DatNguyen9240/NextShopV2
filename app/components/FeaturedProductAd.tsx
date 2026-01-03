"use client";
import React from "react";
import ProductCarousel from "./ProductCarousel";
import AdBanner from "./AdBanner";



const FeaturedProductAd: React.FC = () => (
  <div>
    <h2 className="font-semibold mb-4 text-base text-gray-800">
      Sản phẩm nổi bật
    </h2>
    <div className="px-4 overflow-hidden">
      <ProductCarousel products={[]} slideStep={1} />
    </div>
    <div className="my-6">
      <AdBanner />
    </div>
  </div>
);

export default FeaturedProductAd;
