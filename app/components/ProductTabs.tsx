"use client";
import React, { useState } from "react";
import CarouselButton from "./CarouselButton"; // dùng CarouselButton
import PopularProductsTitle from "./PopularProductsTitle"; // Import component ở đây

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

const visibleCount = 6; // số tab hiển thị
const step = 1; // số tab dịch chuyển mỗi lần

const ProductTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [startIndex, setStartIndex] = useState(0);

  const lastPossibleIndex = Math.max(0, tabs.length - visibleCount); // 6 tab

  const handleNext = () => {
    setStartIndex((prev) => Math.min(prev + step, lastPossibleIndex));
  };

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(prev - step, 0));
  };

  const visibleTabs = tabs.slice(startIndex, startIndex + visibleCount); // 6 tab

  return (
    <div className="relative w-[640px]">
      {/* Hiện title ở md trở xuống */}
      <div className="block md:hidden mb-2">
        <PopularProductsTitle />
      </div>
      {/* Tabs + Carousel Button */}
      <div className="relative">
        {/* Prev Button */}
        {startIndex > 0 && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
            <CarouselButton onClick={handlePrev} direction="prev" size="sm" />
          </div>
        )}
        {/* Tabs */}
        <div className="flex space-x-2 overflow-hidden border rounded-lg xl:px-12 lg:px-0">
          {visibleTabs.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(startIndex + idx)}
              className={`pb-1 text-sm font-medium flex-1 text-center ${
                activeTab === startIndex + idx
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              style={{ minWidth: 80 }}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Next Button */}
        {startIndex < lastPossibleIndex && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
            <CarouselButton onClick={handleNext} direction="next" size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
