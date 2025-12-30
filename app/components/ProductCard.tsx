"use client";
import React from "react";
import { Expand, Heart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import MoneyVND from "./MoneyVND";

export type Product = {
  id?: string;
  label: string;
  priceOld: string;
  priceNew: string;
  percent: string;
  inStock: boolean;
  image: string;
  rating: number;
  totalStockQuantity?: number;
};

export const ProductBadge = ({ percent }: { percent: string }) => (
  <span
    className="
    absolute left-2 top-2 bg-blue-100 text-blue-700
    text-[8px] md:text-[9px] lg:text-[10px] xl:text-xs
    font-bold px-1 py-0.5 rounded-full
    flex items-center justify-center
    w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8
    z-20
  "
  >
    {percent}
  </span>
);

const ProductImageActions = ({ productId }: { productId?: string }) => {
  const router = useRouter();
  return (
    <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-40">
      <button
        className="bg-white rounded-full shadow flex items-center justify-center w-10 h-10"
        onClick={(e) => {
          e.stopPropagation();
          if (productId) {
            router.push(`/product/pop-up/${productId}`);
          }
        }}
        title="Xem chi tiết"
      >
        <Expand size={22} strokeWidth={1} color="#222" />
      </button>
      <button className="bg-white rounded-full shadow flex items-center justify-center w-10 h-10">
        <Heart size={22} strokeWidth={1} color="#222" />
      </button>
    </div>
  );
};

const ProductImage = ({
  src,
  alt,
  hoverSrc,
  productId,
  className = "",
}: {
  src: string;
  alt: string;
  hoverSrc?: string;
  productId?: string;
  className?: string;
}) => {
  const router = useRouter();
  return (
    <div
      className={`relative w-full h-[120px] sm:h-[160px] md:h-[200px] lg:h-[220px] xl:h-[240px] overflow-hidden group mb-6 cursor-pointer ${className}`}
      onClick={() => productId && router.push(`/product/${productId}`)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="
          object-cover rounded-t-lg
          transition-opacity duration-500
          group-hover:opacity-0
          absolute top-0 left-0 z-10
        "
        sizes="100vw"
        priority
      />
      {/* Ảnh hover */}
      {hoverSrc && (
        <Image
          src={hoverSrc}
          alt={alt}
          fill
          className="
            object-cover rounded-t-lg
            transition-transform transition-opacity duration-500
            opacity-0 scale-100
            group-hover:opacity-100 group-hover:scale-110
            absolute top-0 left-0 z-20
          "
          sizes="100vw"
        />
      )}

      <ProductImageActions productId={productId} />
    </div>
  );
};

const ProductLabel = ({ label }: { label: string }) => (
  <div
    className="
    font-semibold text-gray-800 mb-1 text-left w-full
    text-[10px] md:text-[11px] lg:text-xs xl:text-sm
    truncate
  "
  >
    {label}
  </div>
);

export const ProductStock = ({
  inStock,
  bg = false,
  count,
}: {
  inStock: boolean;
  bg?: boolean;
  count?: number | null;
}) => (
  <span
    className={
      (bg
        ? `inline-block px-3 py-1 rounded-full text-xs mb-1 ${
            inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`
        : inStock
        ? "text-green-600 text-xs mb-1"
        : "text-red-600 text-xs mb-1") + " text-left flex items-center gap-2"
    }
  >
    {inStock ? (
      <>
        <span>{"Còn hàng"}</span>
        {typeof count === "number" && (
          <span className="text-gray-600 text-[12px]">({count})</span>
        )}
      </>
    ) : (
      "Hết hàng"
    )}
  </span>
);

export const ProductRating = ({
  rating,
  className = "",
}: {
  rating: number;
  className?: string;
}) => (
  <div className={`flex text-left w-full ${className}`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={i < rating ? "text-yellow-400" : "text-gray-300"}
      >
        ★
      </span>
    ))}
  </div>
);

export const ProductPrice = ({
  priceOld,
  priceNew,
  className = "",
}: {
  priceOld?: string;
  priceNew: string;
  className?: string;
}) => {
  // Only show the old price when it represents a true discount (old > new)
  const parseNumber = (v?: string) => {
    if (!v) return NaN;
    const n = Number(String(v).replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(n) ? n : NaN;
  };

  const oldN = parseNumber(priceOld);
  const newN = parseNumber(priceNew);
  const showOld = !Number.isNaN(oldN) && !Number.isNaN(newN) && oldN > newN;

  return (
    <div
      className={`flex items-center gap-2 ${className}
        text-[10px] md:text-xs lg:text-sm xl:text-base pb-4
      `}
    >
      {showOld && priceOld && <MoneyVND value={priceOld} color="text-gray-400" old />}
      <MoneyVND value={priceNew} color="text-pink-600" />
    </div>
  );
};

const ProductCard: React.FC<{
  product: Product & { imageHover?: string };
  className?: string;
  imageClassName?: string;
}> = ({ product, className = "", imageClassName = "" }) => (
  <motion.div
    layout
    initial={{ scale: 0.95, originX: 0, originY: 0 }}
    animate={{ scale: 1, originX: 0, originY: 0 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className={`
      bg-white rounded-xl border border-gray-100 flex flex-col relative transition-shadow duration-200 hover:shadow-2xl
      w-full
      max-w-[250px] min-w-[130px]
      md:max-w-[380px] md:min-w-[180px]
      lg:max-w-[235px] lg:min-w-[180px]
      xl:max-w-[490px] xl:min-w-[222px]
      ${className}
    `}
  >
    <div className="relative">
      <ProductImage
        src={product.image}
        alt={product.label}
        hoverSrc={product.imageHover}
        productId={product.id}
        className={imageClassName}
      />
      {product.percent && parseFloat(String(product.percent)) > 0 && (
        <ProductBadge percent={product.percent} />
      )}
    </div>
    <div className="flex-1 flex flex-col justify-start items-start w-full px-2 md:px-3 lg:px-4">
      <ProductLabel label={product.label} />
      <div className="flex flex-row flex-wrap items-center w-full text-left gap-2">
        <ProductStock inStock={(product.totalStockQuantity ?? (product.inStock ? 1 : 0)) > 0} />
        <ProductRating rating={product.rating} className="mb-2" />
      </div>
      <ProductPrice priceOld={product.priceOld} priceNew={product.priceNew} />
    </div>
  </motion.div>
);

export default ProductCard;
