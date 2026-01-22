"use client";

import React, { useState, useEffect } from "react";
import ProductModal, { ProductDto } from "@/app/@modal/product/pop-up/[id]/Client";
import ProductCarousel from "@/app/components/ProductCarousel";
import ProductInforTab from "@/app/components/ProductInforTab";
import ProductsTitle from "@/app/components/ProductsTitle";
import useProducts from "@/app/hooks/useProducts";
import { getProductById } from "@/app/services/productService";

export default function ProductPage({ params }: { params: { id: string } }) {
  // Unwrap params which may be a Promise using React.use (future-proof for Next.js)
  type MaybeReactUse = { use?: <T>(v: T) => T };
  const r = React as unknown as MaybeReactUse;
  const resolved = r.use ? r.use(params) : params;
  const id = (resolved as { id?: string })?.id ?? (params as { id?: string })?.id ?? "";

  const [product, setProduct] = useState<ProductDto | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const p = await getProductById(id);
        if (!mounted) return;
        setProduct(p as ProductDto | null);
      } catch (e) {
        console.error(e);
      }
    }
    void load();
    return () => { mounted = false; };
  }, [id]);

  // Related products by same category as current product (exclude current product)
  const { products: relatedProducts, loading: relatedLoading, error: relatedError, refresh: relatedRefresh } = useProducts({ categoryId: product?.categoryId, pageSize: 8, autoFetch: Boolean(product?.categoryId) });
  const filteredRelated = (relatedProducts || []).filter(p => p.id !== id);

  React.useEffect(() => {
    if (product?.categoryId) {
      // ensure we fetch when product data becomes available
      try { relatedRefresh(); } catch { /* ignore */ }
    }
  }, [product?.categoryId, relatedRefresh]);

  return (
    <>
      <ProductModal isModal={false} id={id} product={product} />
      <div className="mt-20">
        <ProductInforTab productId={id} description={product?.description ?? null} additionalInfo={product?.additionalInfo ?? null} />
      </div>
      <section className="max-w-[1300px] w-full mx-auto mt-12 overflow-hidden">
        <ProductsTitle
          title="Sản phẩm thời trang"
          description="Không thể bỏ qua những sản phẩm hot nhất!"
        />
        <div className="px-4 mt-4">
          {product?.categoryId ? (
            relatedLoading ? (
              <div className="py-6 text-gray-500">Đang tải sản phẩm liên quan...</div>
            ) : relatedError ? (
              <div className="py-6 text-red-500">Không thể tải sản phẩm liên quan.</div>
            ) : filteredRelated.length > 0 ? (
              <ProductCarousel products={filteredRelated} />
            ) : (
              <div className="py-6 text-gray-500">Không có sản phẩm liên quan.</div>
            )
          ) : (
            <div className="py-6 text-gray-500">Chưa có danh mục sản phẩm để đề xuất.</div>
          )}
        </div>
      </section>
    </>
  );
}
