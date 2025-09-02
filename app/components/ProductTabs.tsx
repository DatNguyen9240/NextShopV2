"use client";
import React, { useState, useRef, useEffect } from "react";
import { ButtonPrev, ButtonNext } from "./Button";
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
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);

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

  // Kiểm tra khi nào hiện nút Prev/Next
  useEffect(() => {
    const scrollEl = scrollRef.current;
    const checkShow = () => {
      if (scrollEl) {
        setShowPrev(scrollEl.scrollLeft > 0);
        setShowNext(
          scrollEl.scrollLeft + scrollEl.offsetWidth < scrollEl.scrollWidth
        );
      }
    };
    checkShow();
    if (scrollEl) {
      scrollEl.addEventListener("scroll", checkShow);
    }
    window.addEventListener("resize", checkShow);
    return () => {
      if (scrollEl) {
        scrollEl.removeEventListener("scroll", checkShow);
      }
      window.removeEventListener("resize", checkShow);
    };
  }, []);

  return (
    <div className="relative lg:w-[640px] w-[345px] md:w-[600px]">
      {/* Hiện title ở md trở xuống */}
      <div className="block md:hidden mb-2">
        <ProductsTitle
          title="Sản phẩm phổ biến"
          description="Khám phá những sản phẩm được ưa chuộng nhất hiện nay"
        />
      </div>

      {/* Tabs + ButtonPrev/ButtonNext */}
      <div className="relative">
        {/* Prev Button */}
        <ButtonPrev onClick={handlePrev} size="sm" hidden={!showPrev} />

        {/* Tabs */}
        <div
          ref={scrollRef}
          className="flex lg:space-x-2 space-x-0 overflow-x-auto border rounded-lg scrollbar-hide mx-6 xl:mx-12 lg:mx-12 md:mx-12"
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
        <ButtonNext onClick={handleNext} size="sm" hidden={!showNext} />
      </div>
    </div>
  );
});

export default ProductTabs;
