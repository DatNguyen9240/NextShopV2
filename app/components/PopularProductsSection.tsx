"use client";
import React from "react";
import AdBanner from "./AdBanner";
import ProductTabs from "./ProductTabs";
import ProductsTitle from "./ProductsTitle";
import NewProductsSection from "./NewProductsSection";
import Carousel from "./Carousel";
import ProductList from "./ProductCarousel";
import useProducts from "@/app/hooks/useProducts";


const PopularProductsSection: React.FC = () => {
  const currentMonth = new Date().getMonth() + 1;

  const [categoryId, setCategoryId] = React.useState<string | undefined>(undefined);  const handleCategoryChange = React.useCallback((id?: string) => setCategoryId(id), []);  const { products, loading, error, refresh } = useProducts({ section: '', pageSize: 20, categoryId });
  return (
    <section className="w-full xl:mx-[100px] lg:mx-0 mt-10 flex relative">
      <div className="hidden xl:block flex-shrink-0" style={{ width: 260 }}>
        <div className="sticky top-2">
          <AdBanner />
        </div>
      </div>
      <div className="w-[980px] overflow-hidden sm:ml-4 sm:pl-4">
        <div className="flex items-center justify-between mb-2">
          <div className="hidden xl:block">
            <ProductsTitle
              title="Sản phẩm phổ biến"
              description={`Khám phá những sản phẩm phổ biến tháng ${currentMonth} này`}
            />
          </div>
          <div className="flex-shrink-0">
            <ProductTabs onChange={handleCategoryChange} />
          </div>
        </div>

        {loading ? (
          <div className="py-6 text-center text-gray-500">Đang tải sản phẩm...</div>
        ) : error ? (
          <div className="py-6 text-center text-red-500">Không thể tải sản phẩm. <button className="underline" onClick={() => refresh()}>Thử lại</button></div>
        ) : categoryId && products.length === 0 ? (
          <div className="py-6 text-center text-gray-500">Không có sản phẩm trong danh mục này.</div>
        ) : (
          <ProductList products={products} />
        )}

        <NewProductsSection />
        <Carousel size="md" />
      </div>
    </section>
  );
};

export default PopularProductsSection;
