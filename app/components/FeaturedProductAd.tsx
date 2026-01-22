"use client";
import React from "react";
import ProductCarousel from "./ProductCarousel";
import AdBanner from "./AdBanner";
import useProducts from "@/app/hooks/useProducts";
import { useCategories } from '@/app/context/CategoryContext';


const FeaturedProductAd: React.FC = () => {
  const { categories, loading: catLoading } = useCategories();

  // Find category with name containing "nón" or "mũ" (case/diacritics insensitive-ish)
  const hatCategory = categories.find(c => /N[oó]n|mũ|mu/i.test(c.name));
  const categoryId = hatCategory?.categoryId;

  const { products, loading, error, refresh } = useProducts({ categoryId, pageSize: 12, autoFetch: Boolean(categoryId) });

  // If category becomes available later, ensure we fetch
  React.useEffect(() => {
    if (categoryId) refresh();
  }, [categoryId, refresh]);

  return (
    <div>
      <h2 className="font-semibold mb-4 text-base text-gray-800">
        Sản phẩm nổi bật
      </h2>

      {catLoading || loading ? (
        <div className="py-6 text-gray-500">Đang tải...</div>
      ) : error ? (
        <div className="py-6 text-red-500">Không thể tải sản phẩm. <button className="underline" onClick={() => refresh()}>Thử lại</button></div>
      ) : (
        <div className="px-4 overflow-hidden">
          <ProductCarousel products={products} slideStep={1} />
        </div>
      )}

      <div className="my-6">
        <AdBanner type="featured" />
      </div>
    </div>
  );
};

export default FeaturedProductAd;
