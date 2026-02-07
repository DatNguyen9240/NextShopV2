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
  attributes?: Record<string, string>;
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
  categoryId?: string;
};

function normalizeAttrs(attrs?: Record<string, string>) {
  const m: Record<string, string> = {};
  for (const k in attrs ?? {}) {
    const v = attrs?.[k];
    if (v != null && String(v).trim() !== "") m[k.toLowerCase()] = String(v);
  }
  return m;
}

function isMatchAllKeys(
  variantAttrs: Record<string, string>,
  selected: Record<string, string | null>
) {
  for (const k in selected) {
    const sel = selected[k];
    if (!sel) continue; // key chưa chọn thì bỏ qua
    if (variantAttrs[k] !== sel) return false;
  }
  return true;
}

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
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string | null>>({});
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
          setSelectedAttributes({});
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

  // Build attribute metadata (preserve first-seen key casing for display)
  const attributeDisplayMap: Record<string, string> = {};
  const attributeValuesMap: Record<string, string[]> = {};
  if (product?.variants) {
    for (const v of product.variants) {
      for (const k in v.attributes ?? {}) {
        const lk = k.toLowerCase();
        if (!attributeDisplayMap[lk]) attributeDisplayMap[lk] = k;
        const val = v.attributes?.[k];
        if (val) {
          attributeValuesMap[lk] = attributeValuesMap[lk] ?? [];
          if (!attributeValuesMap[lk].includes(val)) attributeValuesMap[lk].push(val);
        }
      }
    }
  }
  const attributeKeysOrder = Object.keys(attributeDisplayMap);

  const variants = product?.variants ?? [];
  const normalizedVariantAttrs = variants.map((v) => normalizeAttrs(v.attributes));

  function getAvailableValuesForKey(key: string) {
    // giữ nguyên các lựa chọn khác, bỏ key hiện tại ra để tính option hợp lệ
    const selectedWithoutKey: Record<string, string | null> = { ...(selectedAttributes ?? {}) };
    delete selectedWithoutKey[key];

    const possible = new Set<string>();
    for (let i = 0; i < variants.length; i++) {
      if (!isMatchAllKeys(normalizedVariantAttrs[i], selectedWithoutKey)) continue;
      const val = normalizedVariantAttrs[i][key];
      if (val) possible.add(val);
    }
    return Array.from(possible);
  }

  useEffect(() => {
    if (!product?.variants?.length) return;

    const variants = product.variants;
    const normalized = variants.map((v) => normalizeAttrs(v.attributes));

    // Chỉ chọn variant khi match tất cả key đã chọn (các key có value)
    const idx = variants.findIndex((v, i) => isMatchAllKeys(normalized[i], selectedAttributes));

    const newVariant =
      idx >= 0
        ? variants[idx]
        : (variants.find((v) => v.isDefault) ?? variants[0] ?? null);

    if (!newVariant) return;

    if (!selectedVariant || newVariant.productVariantId !== selectedVariant.productVariantId) {
      setSelectedVariant(newVariant);

      const imgIdx = newVariant.imageUrl ? uniqueImages.findIndex((u) => u === newVariant.imageUrl) : -1;
      setSelectedImageIndex(imgIdx >= 0 ? imgIdx : 0);
    }
  }, [product?.productId, selectedAttributes, uniqueImages]); // bỏ selectedVariant khỏi deps để đỡ loop

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

              {attributeKeysOrder.map((lk) => (
                <div key={lk} className="mb-4 flex items-center">
                  <span className="mr-2 text-black">{attributeDisplayMap[lk]}:</span>
                  {getAvailableValuesForKey(lk).map((value) => (
                    <button
                      key={value}
                      className={`px-3 py-1 rounded-md mr-2 ${
                        selectedAttributes[lk] === value
                          ? "bg-pink-50 border border-pink-600 text-pink-600"
                          : "bg-white border border-gray-200"
                      }`}
                      onClick={() => {
                        setSelectedAttributes((prev) => ({ ...(prev ?? {}), [lk]: String(value) }));
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              ))}

              <div className="flex items-center gap-4 my-6">
                <ButtonMinus onClick={() => setQuantity((q) => Math.max(1, q - 1))} />
                <span className="mx-2 text-xl text-black">{quantity}</span>
                <ButtonPlus onClick={() => setQuantity((q) => q + 1)} />
                <AddToCartButton
                  disabled={!selectedVariant || (selectedVariant.stockQuantity ?? 0) <= 0}
                  onClick={async () => {
                    if (!selectedVariant) return;
                    try {
                      await import('@/app/services/cartService').then(m => m.addToCart({ variantId: selectedVariant.productVariantId, quantity }));
                      toast.success('Đã thêm vào giỏ hàng');
                    } catch (e) {
                      console.error(e);
                      toast.error('Thêm vào giỏ hàng thất bại');
                    }
                  }}
                />
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
