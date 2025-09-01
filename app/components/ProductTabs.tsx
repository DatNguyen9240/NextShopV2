"use client";
import React, { useState, useRef } from "react";
import CarouselButton from "./CarouselButton";
import ProductsTitle from "./ProductsTitle";

const tabs = [
  "Quần áo",
  "Áo",
  "Quần",
  "Túi xách",
  "Balo",
  "Ví",
  "Đồ nam",
  "Đồ nữ",
  "Thể thao",
  "Trẻ em",
];

const ProductTabs = React.memo(function ProductTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -80, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 80, behavior: "smooth" });
    }
  };

  return (
    <div className="relative lg:w-[640px] w-[390px]">
      {/* Hiện title ở md trở xuống */}
      <div className="block md:hidden mb-2">
        <ProductsTitle
          title="Sản phẩm phổ biến"
          description="Khám phá những sản phẩm được ưa chuộng nhất hiện nay"
        />
      </div>

      {/* Tabs + Carousel Button */}
      <div className="relative">
        {/* Prev Button */}
        <CarouselButton onClick={handlePrev} direction="prev" size="sm" />

        {/* Tabs */}
        <div
          ref={scrollRef}
          className="flex lg:space-x-2 space-x-0 overflow-x-auto border rounded-lg scrollbar-hide mx-12"
        >
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`pb-1 text-sm font-medium flex-1 text-center lg:min-w-[80px] min-w-[100px] ${
                activeTab === idx
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <CarouselButton onClick={handleNext} direction="next" size="sm" />
      </div>
    </div>
  );
});

export default ProductTabs;
