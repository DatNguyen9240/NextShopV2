"use client";
import React, { useState, useEffect } from "react";
import AdBanner from "./AdBanner";
import ProductCard from "./ProductCard";
import ProductTabs from "./ProductTabs";
import CarouselButton from "./CarouselButton";
import PopularProductsTitle from "./PopularProductsTitle";

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
    priceOld: "1450",
    priceNew: "1300",
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

function useBreakpoint() {
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const listener = () => setIsLg(media.matches);
    listener();
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return { isLg };
}

const PopularProductsSection: React.FC = () => {
  const [startIdx, setStartIdx] = useState(0);
  const { isLg } = useBreakpoint();

  // card size + gap theo breakpoint
  const cardWidth = isLg ? 220 : 180;
  const gap = isLg ? 18 : 8;

  const visibleCount = 4;
  const step = isLg ? 2.75 : 1.5;

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
            <PopularProductsTitle />
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
          {startIdx > 0 && (
            <CarouselButton
              direction="prev"
              onClick={handlePrev}
              size={isLg ? "md" : "sm"}
            />
          )}
          {startIdx + visibleCount < products.length && (
            <CarouselButton
              direction="next"
              onClick={handleNext}
              size={isLg ? "md" : "sm"}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularProductsSection;
