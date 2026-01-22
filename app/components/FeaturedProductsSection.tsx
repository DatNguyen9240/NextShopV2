"use client";
import React from "react";
import SectionTitle from "./SectionTitle";
import ProductCarousel from "./ProductCarousel";
import Carousel from "./Carousel";
import ProductsTitle from "./ProductsTitle";
import { useBreakpoint } from "../hooks/useBreakpoint";
import useProducts from "@/app/hooks/useProducts";
import { useCategories } from "@/app/context/CategoryContext";

const FeaturedProductsSection: React.FC = () => {
  const breakpoint = useBreakpoint();
  const carouselSize = breakpoint === "base" ? "sm" : "md";

  const { categories } = useCategories();

  // Find categories for bags/wallets and shoes
  const bagCategory = categories.find(c => /T[úu]i|ví|vi|túi xách/i.test(c.name));
  const shoeCategory = categories.find(c => /gi[aàá]y|giay|d[eéè]p|dep/i.test(c.name));

  const { products: bagProducts, loading: bagLoading, error: bagError, refresh: bagRefresh } = useProducts({ categoryId: bagCategory?.categoryId, pageSize: 12, autoFetch: Boolean(bagCategory?.categoryId) });
  const { products: shoeProducts, loading: shoeLoading, error: shoeError, refresh: shoeRefresh } = useProducts({ categoryId: shoeCategory?.categoryId, pageSize: 12, autoFetch: Boolean(shoeCategory?.categoryId) });

  React.useEffect(() => { if (bagCategory?.categoryId) bagRefresh(); }, [bagCategory?.categoryId, bagRefresh]);
  React.useEffect(() => { if (shoeCategory?.categoryId) shoeRefresh(); }, [shoeCategory?.categoryId, shoeRefresh]);

  return (
    <section className="max-w-[1300px] w-full mx-auto mt-12 overflow-hidden">
      <div className="w-full flex justify-start">
        <SectionTitle size="xl">Sản phẩm nổi bật</SectionTitle>
      </div>
      <div className="px-4">
        {bagLoading ? (
          <div className="py-6 text-gray-500">Đang tải...</div>
        ) : bagError ? (
          <div className="py-6 text-red-500">Không thể tải sản phẩm. <button className="underline" onClick={() => bagRefresh()}>Thử lại</button></div>
        ) : bagProducts && bagProducts.length > 0 ? (
          <ProductCarousel products={bagProducts} />
        ) : (
          <div className="py-6 text-gray-500">Chưa cập nhật</div>
        )}
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
          {shoeLoading ? (
            <div className="py-6 text-gray-500">Đang tải...</div>
          ) : shoeError ? (
            <div className="py-6 text-red-500">Không thể tải sản phẩm. <button className="underline" onClick={() => shoeRefresh()}>Thử lại</button></div>
          ) : shoeProducts && shoeProducts.length > 0 ? (
            <ProductCarousel products={shoeProducts} />
          ) : (
            <div className="py-6 text-gray-500">Chưa cập nhật</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
