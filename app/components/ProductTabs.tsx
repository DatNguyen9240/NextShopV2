"use client";

import React, { useState, useRef, useEffect } from "react";
import { ButtonPrev, ButtonNext } from "./Button";
import ProductsTitle from "./ProductsTitle";
import { getCategories } from "../services/categoryService";

const ProductTabs = React.memo(function ProductTabs() {

  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState<{ name: string; categoryId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCategories()
      .then((data) => {
        if (Array.isArray(data)) {
          setTabs(data.map((c: any) => ({ name: c.name, categoryId: c.categoryId })));
        }
      })
      .finally(() => setLoading(false));
  }, []);

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

  // Kiểm tra showPrev/showNext khi tabs thay đổi hoặc khi scroll/resize
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
  }, [tabs, loading]);

  // Scroll active tab into center when it changes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const buttons = el.querySelectorAll('button');
    if (!buttons || buttons.length === 0) return;

    const idx = Math.max(0, Math.min(activeTab, buttons.length - 1));
    const activeEl = buttons[idx] as HTMLElement | undefined;
    if (!activeEl) return;

    const elLeft = activeEl.offsetLeft;
    const elWidth = activeEl.offsetWidth;
    const containerWidth = el.offsetWidth;

    const target = Math.max(0, elLeft - containerWidth / 2 + elWidth / 2);
    el.scrollTo({ left: target, behavior: 'smooth' });
  }, [activeTab, tabs]);

  return (
    <div className="relative lg:w-[640px] w-[345px] md:w-[600px]">
      <div className="block md:hidden mb-2">
        <ProductsTitle
          title="Sản phẩm phổ biến"
          description="Khám phá những sản phẩm được ưa chuộng nhất hiện nay"
        />
      </div>

      <div className="relative">
        <ButtonPrev onClick={handlePrev} size="sm" hidden={!showPrev} />

        <div
          ref={scrollRef}
          className="flex lg:space-x-2 space-x-0 overflow-x-auto rounded-lg scrollbar-hide mx-6 xl:mx-12 lg:mx-12 md:mx-12"
        >
          {loading ? (
            <div className="text-gray-400 px-4 py-2">Đang tải...</div>
          ) : tabs.length === 0 ? (
            <div className="text-gray-400 px-4 py-2">Không có danh mục</div>
          ) : (
            tabs.map((tab, idx) => (
              <button
                key={tab.categoryId}
                onClick={() => setActiveTab(idx)}
                className={`pb-1 text-sm font-medium flex-1 text-center lg:min-w-[80px] min-w-[100px] ${
                  activeTab === idx
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.name}
              </button>
            ))
          )}
        </div>

        <ButtonNext onClick={handleNext} size="sm" hidden={!showNext} />
      </div>
    </div>
  );
});

export default ProductTabs;
