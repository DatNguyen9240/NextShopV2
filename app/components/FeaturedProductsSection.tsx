"use client";
import React from "react";
import SectionTitle from "./SectionTitle";
import ProductCarousel from "./ProductCarousel";
import Carousel from "./Carousel";
import ProductsTitle from "./ProductsTitle";
import { useBreakpoint } from "../hooks/useBreakpoint";
// Dữ liệu mẫu sản phẩm nổi bật
const featuredProducts = [
  {
    id: "f1",
    label: "iPhone 15 Pro Max1",
    priceOld: "35000000",
    priceNew: "29990000",
    percent: "14%",
    inStock: true,
    image: "/sell_off/01.jpg",
    rating: 5,
  },
  {
    id: "f2",
    label: "Samsung Galaxy S24 Ultra",
    priceOld: "32000000",
    priceNew: "28990000",
    percent: "10%",
    inStock: true,
    image: "/products/s24-ultra.jpg",
    rating: 5,
  },
  {
    id: "f3",
    label: "MacBook Air M3",
    priceOld: "28000000",
    priceNew: "24990000",
    percent: "11%",
    inStock: true,
    image: "/products/macbook-air-m3.jpg",
    rating: 5,
  },
  {
    id: "f4",
    label: "Sony WH-1000XM5",
    priceOld: "9000000",
    priceNew: "7990000",
    percent: "12%",
    inStock: true,
    image: "/products/sony-xm5.jpg",
    rating: 5,
  },
  {
    id: "f5",
    label: "Apple Watch Series 6",
    priceOld: "12000000",
    priceNew: "10990000",
    percent: "8%",
    inStock: true,
    image: "/products/apple-watch-6.jpg",
    rating: 5,
  },
  {
    id: "f6",
    label: "Apple Watch Series 6",
    priceOld: "12000000",
    priceNew: "10990000",
    percent: "8%",
    inStock: true,
    image: "/products/apple-watch-6.jpg",
    rating: 5,
  },
  // Thêm 10 sản phẩm mới
  {
    id: "f7",
    label: "Oppo Reno 7",
    priceOld: "12000000",
    priceNew: "9990000",
    percent: "17%",
    inStock: true,
    image: "/products/oppo-reno-11.jpg",
    rating: 4,
  },
  {
    id: "f8",
    label: "Xiaomi Redmi Note 13",
    priceOld: "8000000",
    priceNew: "6990000",
    percent: "13%",
    inStock: true,
    image: "/products/redmi-note-13.jpg",
    rating: 4,
  },
  {
    id: "f9",
    label: "Vivo V30 Pro",
    priceOld: "10000000",
    priceNew: "8990000",
    percent: "10%",
    inStock: true,
    image: "/products/vivo-v30-pro.jpg",
    rating: 4,
  },
  {
    id: "f10",
    label: "Realme 12 Pro",
    priceOld: "9500000",
    priceNew: "8490000",
    percent: "11%",
    inStock: true,
    image: "/products/realme-12-pro.jpg",
    rating: 4,
  },
  {
    id: "f11",
    label: "iPad Air 2024",
    priceOld: "18000000",
    priceNew: "15990000",
    percent: "11%",
    inStock: true,
    image: "/products/ipad-air-2024.jpg",
    rating: 5,
  },
  {
    id: "f12",
    label: "MacBook Pro M3",
    priceOld: "40000000",
    priceNew: "36990000",
    percent: "8%",
    inStock: true,
    image: "/products/macbook-pro-m3.jpg",
    rating: 5,
  },
  {
    id: "f13",
    label: "Samsung Galaxy Tab S9",
    priceOld: "22000000",
    priceNew: "19990000",
    percent: "9%",
    inStock: true,
    image: "/products/tab-s9.jpg",
    rating: 5,
  },
  {
    id: "f14",
    label: "Apple AirPods Pro 2",
    priceOld: "6500000",
    priceNew: "5990000",
    percent: "8%",
    inStock: true,
    image: "/products/airpods-pro-2.jpg",
    rating: 5,
  },
  {
    id: "f15",
    label: "Sony WF-1000XM5",
    priceOld: "7000000",
    priceNew: "6490000",
    percent: "7%",
    inStock: true,
    image: "/products/sony-wf-1000xm5.jpg",
    rating: 5,
  },
  {
    id: "f16",
    label: "Garmin Forerunner 965",
    priceOld: "15000000",
    priceNew: "13990000",
    percent: "7%",
    inStock: true,
    image: "/products/garmin-965.jpg",
    rating: 5,
  },
];

const FeaturedProductsSection: React.FC = () => {
  const breakpoint = useBreakpoint();
  const carouselSize = breakpoint === "base" ? "sm" : "md";

  return (
    <section className="max-w-[1300px] w-full mx-auto mt-12 overflow-hidden">
      <div className="w-full flex justify-start">
        <SectionTitle size="xl">Sản phẩm nổi bật</SectionTitle>
      </div>
      <div className="px-4">
        <ProductCarousel products={featuredProducts} />
      </div>
      <Carousel
        size={carouselSize}
        showIndicator={["base", "sm", "md"].includes(breakpoint)}
      />
      <div className="mt-10">
        <ProductsTitle
          title="Sản phẩm thời trang"
          description="Không thể bỏ qua những sản phẩm hot nhất!"
        />
        <div className="px-4 mt-4">
          <ProductCarousel products={featuredProducts} />
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
