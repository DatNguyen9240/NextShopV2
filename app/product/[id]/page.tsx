"use client";

import React, { useState, useEffect } from "react";
import ProductModal from "@/app/@modal/product/pop-up/[id]/Client";
import ProductCarousel from "@/app/components/ProductCarousel";
import ProductInforTab from "@/app/components/ProductInforTab";
import ProductsTitle from "@/app/components/ProductsTitle";
import { getProductById } from "@/app/services/productService";

export default function ProductPage({ params }: { params: { id: string } }) {
  // Unwrap params which may be a Promise using React.use (future-proof for Next.js)
  const resolved = (React as any).use ? (React as any).use(params) : params;
  const id = resolved?.id ?? (params as any)?.id;

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const p = await getProductById(id);
        if (!mounted) return;
        setProduct(p);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, [id]);

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
          <ProductCarousel products={[]} />
        </div>
      </section>
    </>
  );
}
