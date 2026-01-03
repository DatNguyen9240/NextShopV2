"use client";
import React from "react";
import SectionTitle from "./SectionTitle";
import ProductCarousel from "./ProductCarousel";
import Carousel from "./Carousel";
import ProductsTitle from "./ProductsTitle";
import { useBreakpoint } from "../hooks/useBreakpoint";

const FeaturedProductsSection: React.FC = () => {
  const breakpoint = useBreakpoint();
  const carouselSize = breakpoint === "base" ? "sm" : "md";

  return (
    <section className="max-w-[1300px] w-full mx-auto mt-12 overflow-hidden">
      <div className="w-full flex justify-start">
        <SectionTitle size="xl">Sản phẩm nổi bật</SectionTitle>
      </div>
      <div className="px-4">
        <ProductCarousel products={[]} />
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
          <ProductCarousel products={[]} />
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
