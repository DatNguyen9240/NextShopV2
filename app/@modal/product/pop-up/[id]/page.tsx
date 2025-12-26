"use client";

import { useState, use, useEffect } from "react";
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

type Variant = {
  productVariantId: string;
  basePrice: number;
  priceAfterDiscount: number;
  imageUrl?: string;
  imgHover?: string;
  thumbnailUrl?: string;
  isDefault?: boolean;
  stockQuantity?: number;
  size?: string | null;
  color?: string | null;
};

type ProductDto = {
  productId: string;
  name: string;
  brand?: string | null;
  averageRating?: number;
  description?: string | null;
  images?: string[];
  variants?: Variant[];
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

export default function ProductModal({
  params,
  isModal = true,
}: {
  params: Promise<{ id: string }>;
  isModal?: boolean;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        // Use central product service
        const p = await getProductById(id);
        if (!mounted) return;
        if (p) {
          setProduct(p as ProductDto);
          const def = (p?.variants || []).find((v: any) => v.isDefault) as Variant | undefined;
          setSelectedVariant(def ?? (p?.variants && p?.variants.length > 0 ? p.variants[0] : null));
          if (def && def.size) setSelectedSize(def.size);
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
  }, [id]);

  // Build images array from selectedVariant and product, but DO NOT fallback to local placeholder images
  const imagesFromVariant = selectedVariant?.imageUrl ? [selectedVariant.imageUrl, ...(product?.images ?? [])] : (product?.images ?? []);
  // While loading, pass undefined so ProductImages shows skeleton; after loaded, pass either images array or empty array
  const imagesProp = loading ? undefined : (imagesFromVariant.length > 0 ? imagesFromVariant : []);

  return (
    <>
      {isModal && (
        <div className="flex justify-between items-start">
          <div className="w-full">
            <ProductInfo product={product} />
          </div>
          <ButtonClose
            className="absolute right-4 top-4 z-20"
            onClick={() => router.back()}
          />
        </div>
      )}
      {isModal && <hr className="mb-4" />}

      <div className="flex md:gap-4 xl:gap-18 flex-wrap">
        <ProductImages images={imagesProp} />
        <div className="flex-1 min-w-[250px] overflow-hidden">
          {!isModal && <ProductInfo product={product} />}

          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <ProductPrice
                  priceOld={selectedVariant ? String(selectedVariant.basePrice) : ""}
                  priceNew={selectedVariant ? String(selectedVariant.priceAfterDiscount) : "0"}
                  className="text-2xl"
                />
              </div>
              <ProductStock inStock={(selectedVariant?.stockQuantity ?? 0) > 0} bg />

              <p className="text-gray-700 mb-16">{product?.description}</p>

              <div className="mb-4 flex items-center">
                <span className="mr-2 text-black">Size:</span>
                {Array.from(new Set((product?.variants || []).map((v) => v.size || "M"))).map((size) => (
                  <ButtonSize
                    key={String(size)}
                    value={String(size)}
                    selected={selectedSize === String(size)}
                    onClick={() => setSelectedSize(String(size))}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4 my-6">
                <ButtonMinus onClick={() => setQuantity((q) => Math.max(1, q - 1))} />
                <span className="mx-2 text-xl text-black">{quantity}</span>
                <ButtonPlus onClick={() => setQuantity((q) => q + 1)} />
                <AddToCartButton />
              </div>
              <div className="flex gap-3">
                <WishlistButton />
                <CompareButton />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
