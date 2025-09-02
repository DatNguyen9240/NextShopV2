"use client";
import React, { useState } from "react";
import AdBanner from "./AdBanner";
import ProductCard from "./ProductCard";
import ProductTabs from "./ProductTabs";
import { ButtonPrev, ButtonNext } from "./Button";
import ProductsTitle from "./ProductsTitle";
import NewProductsSection from "./NewProductsSection";
import Carousel from "./Carousel";
import { useBreakpoint } from "@/app/hooks/useBreakpoint";

const products = [
  {
    id: "1",
    label: "Men Alias-N Regular ... 1",
    priceOld: "420000",
    priceNew: "298000",
    percent: "10%",
    inStock: true,
    image: "/sell_off/01.jpg",
    imageHover: "/sell_off/02.jpg",
    rating: 4,
  },
  {
    id: "2",
    label: "A-Line Kurti With Sh... 2",
    priceOld: "145000",
    priceNew: "130000",
    percent: "8%",
    inStock: true,
    image: "/sell_off/02.jpg",
    rating: 5,
  },
  {
    id: "3",
    label: "Chikankari Woven Kur... 3",
    priceOld: "1350",
    priceNew: "1200",
    percent: "10%",
    inStock: true,
    image: "/products/03.jpg",
    rating: 5,
  },
  {
    id: "4",
    label: "Men Layerr Regular F... 4",
    priceOld: "1200",
    priceNew: "950",
    percent: "12%",
    inStock: true,
    image: "/products/04.jpg",
    rating: 5,
  },
  {
    id: "5",
    label: "Men Layerr Regular F... 5",
    priceOld: "1200",
    priceNew: "950",
    percent: "12%",
    inStock: true,
    image: "/products/04.jpg",
    rating: 5,
  },
  {
    id: "6",
    label: "Men Layerr Regular F... 6",
    priceOld: "1200",
    priceNew: "950",
    percent: "12%",
    inStock: true,
    image: "/products/04.jpg",
    rating: 5,
  },
  {
    id: "7",
    label: "Men Layerr Regular F... 7",
    priceOld: "1200",
    priceNew: "950",
    percent: "12%",
    inStock: true,
    image: "/products/04.jpg",
    rating: 5,
  },
  {
    id: "8",
    label: "Men Layerr Regular F... 8",
    priceOld: "1200",
    priceNew: "950",
    percent: "12%",
    inStock: true,
    image: "/products/04.jpg",
    rating: 5,
  },
  {
    id: "9",
    label: "Men Layerr Regular F... 9",
    priceOld: "1200",
    priceNew: "950",
    percent: "12%",
    inStock: true,
    image: "/products/04.jpg",
    rating: 5,
  },
  {
    id: "10",
    label: "Men Layerr Regular F... 10",
    priceOld: "1200",
    priceNew: "950",
    percent: "12%",
    inStock: true,
    image: "/products/04.jpg",
    rating: 5,
  },
  {
    id: "11",
    label: "Men Layerr Regular F... 11",
    priceOld: "1200",
    priceNew: "950",
    percent: "12%",
    inStock: true,
    image: "/products/04.jpg",
    rating: 5,
  },
  {
    id: "12",
    label: "Men Layerr Regular F... 12",
    priceOld: "1200",
    priceNew: "950",
    percent: "12%",
    inStock: true,
    image: "/products/04.jpg",
    rating: 5,
  },
  {
    id: "13",
    label: "Men Layerr Regular F... 13",
    priceOld: "1200",
    priceNew: "950",
    percent: "12%",
    inStock: true,
    image: "/products/04.jpg",
    rating: 5,
  },
];

const CARD_CONFIG = {
  base: { cardWidth: 180, gap: 8, visibleCount: 4, step: 1.5 },
  sm: { cardWidth: 180, gap: 8, visibleCount: 4, step: 1.5 },
  md: { cardWidth: 180, gap: 8, visibleCount: 4, step: 1.5 },
  lg: { cardWidth: 220, gap: 18, visibleCount: 4, step: 2.75 },
  xl: { cardWidth: 220, gap: 18, visibleCount: 4, step: 2.75 },
};

const PopularProductsSection: React.FC = () => {
  const [startIdx, setStartIdx] = useState(0);
  const breakpoint = useBreakpoint();

  const { cardWidth, gap, visibleCount, step } = CARD_CONFIG[breakpoint];

  const handlePrev = () => {
    setStartIdx((prev) => Math.max(prev - step, 0));
  };

  const handleNext = () => {
    setStartIdx((prev) =>
      Math.min(prev + step, products.length - visibleCount)
    );
  };

  return (
    <section className="w-full xl:mx-[100px] lg:mx-0 mt-10 flex">
      <AdBanner />
      <div className="w-[980px] overflow-hidden sm:ml-4 sm:pl-4">
        <div className="flex items-center justify-between mb-2">
          {/* Chỉ hiện title ở md trở lên */}
          <div className="hidden xl:block">
            <ProductsTitle
              title="Sản phẩm phổ biến"
              description="Khám phá những sản phẩm phổ biến tháng 9 này"
            />
          </div>
          <div className="flex-shrink-0">
            <ProductTabs />
          </div>
        </div>
        <div className="relative">
          <div
            className="flex gap-4 transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${startIdx * (cardWidth + gap)}px)`,
            }}
          >
            {products.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
          <ButtonPrev onClick={handlePrev} size={"md"} hidden={startIdx <= 0} />
          <ButtonNext
            onClick={handleNext}
            size={"md"}
            hidden={startIdx + visibleCount >= products.length}
          />
        </div>
        <NewProductsSection />
        <Carousel size="sm" />
      </div>
    </section>
  );
};

export default PopularProductsSection;
