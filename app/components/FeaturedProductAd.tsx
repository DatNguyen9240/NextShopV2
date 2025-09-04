"use client";
import React from "react";
import ProductCarousel from "./ProductCarousel";
import AdBanner from "./AdBanner";

const featuredProducts = [
  {
    id: "1",
    label: "photo...",
    priceOld: "2000",
    priceNew: "4000",
    percent: "10%",
    inStock: true,
    image: "/images/shoes.jpg",
    rating: 5,
  },
  {
    id: "2",
    label: "photo...",
    priceOld: "2000",
    priceNew: "4000",
    percent: "10%",
    inStock: true,
    image: "/images/shoes.jpg",
    rating: 4,
  },
  {
    id: "3",
    label: "photo...",
    priceOld: "2000",
    priceNew: "4000",
    percent: "10%",
    inStock: true,
    image: "/images/shoes.jpg",
    rating: 3,
  },
];

const FeaturedProductAd: React.FC = () => (
  <div>
    <h2 className="font-semibold mb-4 text-base text-gray-800">
      Sản phẩm nổi bật
    </h2>
    <div className="px-4 overflow-hidden">
      <ProductCarousel products={featuredProducts} slideStep={1} />
    </div>
    <div className="my-6">
      <AdBanner />
    </div>
  </div>
);

export default FeaturedProductAd;
