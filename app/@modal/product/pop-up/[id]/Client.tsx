"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SectionTitle from "@/app/components/SectionTitle";
import {
  ProductRating,
  ProductPrice,
  ProductStock,
} from "@/app/components/ProductCard";
import {
  ButtonMinus,
  ButtonPlus,
  AddToCartButton,
  ButtonSize,
  WishlistButton,
  CompareButton,
  ButtonClose,
} from "@/app/components/Button";
import ProductImages from "@/app/components/ProductImages";
import { getProductById } from "@/app/services/productService";
import { toast } from 'react-hot-toast';

export type Variant = {
  productVariantId: string;
  basePrice: number;
  priceAfterDiscount: number;
  imageUrl?: string;
  imgHover?: string;
  isDefault?: boolean;
  discountPercent?: number;
  size?: string | null;
  color?: string | null;
  stockQuantity?: number;
};

export type ProductDto = {
  productId: string;
  name: string;
  brand?: string | null;
  averageRating?: number;
  description?: string | null;
  additionalInfo?: string | null;
  images?: string[];
  variants?: Variant[];
  totalStockQuantity?: number;
};

function ProductInfo({ product }: { product?: ProductDto | null }) {
  if (!product) return null;
  return (
    <>
      <SectionTitle>
        <span className="text-xl md:text-2xl">{product.name}</span>
      </SectionTitle>
      <div className="-mt-6 mb-2">
        <div className="text-gray-600">
          Brands: <span className="font-semibold">{product.brand}</span>
        </div>
        <ProductRating rating={Math.round(product.averageRating || 0)} />
      </div>
    </>
  );
}

export default function ProductModal({ id, isModal = true, product: initialProduct }: { id: string; isModal?: boolean; product?: ProductDto | null }) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProductDto | null>(initialProduct ?? null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      // If parent provided product, use it and skip network fetch
      if (initialProduct) {
        setProduct(initialProduct);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const p = await getProductById(id);
        console.log("[ProductModal] product response:", p);
        if (!mounted) return;
        if (p) {
          setProduct(p as ProductDto);

          const variants: Variant[] = p?.variants ?? [];
          const defaultVariant = variants.find((v: Variant) => v.isDefault);
          const initial = defaultVariant ?? (variants.length > 0 ? variants[0] : null);

          setSelectedVariant(initial ?? null);
          setSelectedSize(initial?.size ?? null);
          setSelectedColor(initial?.color ?? null);
          // compute images local to avoid referencing outer uniqueImages (which depends on product)
          const localImages = Array.from(new Set(variants.map((v: Variant) => v.imageUrl).filter((u): u is string => typeof u === 'string' && !!u)));
          const initImage = (initial as Variant | null)?.imageUrl;
          const initIdx = initImage ? localImages.findIndex((u) => u === initImage) : -1;
          setSelectedImageIndex(initIdx >= 0 ? initIdx : 0);
        } else {
          console.error("Product load failed: no data returned");
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id, initialProduct]);

  const allVariantImages = (product?.variants || []).map((v) => v.imageUrl).filter((u): u is string => !!u);
  const uniqueImages = Array.from(new Set(allVariantImages));
  const imagesProp = loading ? undefined : (uniqueImages.length > 0 ? uniqueImages : []);

  // Keep thumbnails positions fixed — track which image index is selected for main view
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  useEffect(() => {
    // Reset selected image when product changes
    setSelectedImageIndex(0);
  }, [product?.productId, id]);

  useEffect(() => {
    if (!product || !product.variants) return;
    const variants = product.variants;

    const resolve = (color?: string | null, size?: string | null) => {
      const byBoth = variants.filter((v) => (!color || v.color === color) && (!size || v.size === size));
      if (byBoth.length > 0) return byBoth[0];

      if (color) {
        const byColor = variants.filter((v) => v.color === color);
        if (byColor.length > 0) return byColor[0];
      }

      if (size) {
        const bySize = variants.filter((v) => v.size === size);
        if (bySize.length > 0) return bySize[0];
      }

      const def = variants.find((v) => v.isDefault) ?? variants[0];
      return def;
    };

    const newVariant = resolve(selectedColor, selectedSize);
    if (newVariant && (!selectedVariant || newVariant.productVariantId !== selectedVariant.productVariantId)) {
      setSelectedVariant(newVariant);
      if (newVariant.size) setSelectedSize(newVariant.size);
      if (newVariant.color) setSelectedColor(newVariant.color);
      // Change main image to the variant's image (if present)
      const idx = newVariant.imageUrl ? uniqueImages.findIndex((u) => u === newVariant.imageUrl) : -1;
      setSelectedImageIndex(idx >= 0 ? idx : 0);
      console.debug('[ProductModal] Resolved variant:', newVariant);
    }
  }, [selectedColor, selectedSize, product, uniqueImages, selectedVariant]);

  return (
    <>
      {isModal && (
        <div className="flex justify-between items-start">
          <div className="w-full">
            <ProductInfo product={product} />
          </div>
          <ButtonClose className="absolute right-4 top-4 z-20" onClick={() => router.back()} />
        </div>
      )}
      {isModal && <hr className="mb-4" />}

      <div className="flex md:gap-4 xl:gap-18 flex-wrap">
        <ProductImages
          images={imagesProp}
          selectedIndex={selectedImageIndex}
          onSelect={(idx) => setSelectedImageIndex(idx)}
          badgePercent={selectedVariant && selectedVariant.discountPercent && selectedVariant.discountPercent > 0 ? `${selectedVariant.discountPercent}%` : undefined}
        />
        <div className="flex-1 min-w-[250px] overflow-hidden">
          {!isModal && <ProductInfo product={product} />}

          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <ProductPrice priceOld={selectedVariant ? String(selectedVariant.basePrice) : ""} priceNew={selectedVariant ? String(selectedVariant.priceAfterDiscount) : "0"} className="text-2xl" />
              </div>
              <div className="mb-4">
                <ProductStock inStock={(selectedVariant ? (selectedVariant.stockQuantity ?? product?.totalStockQuantity ?? 0) : (product?.totalStockQuantity ?? 0)) > 0} bg count={selectedVariant ? (selectedVariant.stockQuantity ?? product?.totalStockQuantity ?? 0) : (product?.totalStockQuantity ?? 0)} />
              </div>

              <p className="text-gray-700 mb-12">{product?.description}</p>

              <div className="mb-4 flex items-center">
                <span className="mr-2 text-black">Color:</span>
                {Array.from(new Set((product?.variants || []).map((v) => v.color || ""))).filter(Boolean).map((color) => (
                  <button key={String(color)} className={`px-3 py-1 rounded-md mr-2 ${selectedColor === color ? 'bg-pink-50 border border-pink-600 text-pink-600' : 'bg-white border border-gray-200'}`} onClick={() => setSelectedColor(String(color))}>
                    {color}
                  </button>
                ))}
              </div>

              <div className="mb-4 flex items-center">
                <span className="mr-2 text-black">Size:</span>
                {Array.from(new Set((product?.variants || []).map((v) => v.size || "M"))).map((size) => (
                  <ButtonSize key={String(size)} value={String(size)} selected={selectedSize === String(size)} onClick={() => setSelectedSize(String(size))} />
                ))}
              </div>

              <div className="flex items-center gap-4 my-6">
                <ButtonMinus onClick={() => setQuantity((q) => Math.max(1, q - 1))} />
                <span className="mx-2 text-xl text-black">{quantity}</span>
                <ButtonPlus onClick={() => setQuantity((q) => q + 1)} />
                <AddToCartButton disabled={(product?.totalStockQuantity ?? 0) <= 0} onClick={async () => {
                  if (!selectedVariant) return;
                  try {
                    await import('@/app/services/cartService').then(m => m.addToCart({ variantId: selectedVariant.productVariantId, quantity }));
                    toast.success('Đã thêm vào giỏ hàng');
                  } catch (e) {
                    console.error(e);
                    toast.error('Thêm vào giỏ hàng thất bại');
                  }
                }} />
              </div>
              <div className="flex gap-3">
                <WishlistButton productId={product?.productId ?? null} />
                <CompareButton />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
