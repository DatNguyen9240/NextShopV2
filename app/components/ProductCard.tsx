"use client";
import React from "react";
import { Expand, Heart } from "lucide-react";
import Image from "next/image";

type Product = {
  id?: string;
  label: string;
  priceOld: string;
  priceNew: string;
  percent: string;
  inStock: boolean;
  image: string;
  rating: number;
};

const ProductBadge = ({ percent }: { percent: string }) => (
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

const ProductImageActions = () => (
  <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
    <button className="bg-white rounded-full shadow flex items-center justify-center w-10 h-10">
      <Expand size={22} strokeWidth={1} color="#222" />
    </button>
    <button className="bg-white rounded-full shadow flex items-center justify-center w-10 h-10">
      <Heart size={22} strokeWidth={1} color="#222" />
    </button>
  </div>
);

const ProductImage = ({
  src,
  alt,
  hoverSrc,
}: {
  src: string;
  alt: string;
  hoverSrc?: string;
}) => (
  <div className="relative w-full h-[120px] sm:h-[160px] md:h-[200px] lg:h-[220px] xl:h-[240px] overflow-hidden group mb-6">
    {/* Ảnh gốc */}
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
          absolute top-0 left-0 z-10
        "
        sizes="100vw"
      />
    )}
    {/* Nút hiện khi hover */}
    <ProductImageActions />
  </div>
);

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

const ProductStock = ({ inStock }: { inStock: boolean }) => (
  <div
    className="
    text-green-600 text-[10px] md:text-[11px] lg:text-xs mb-1 text-left w-full
  "
  >
    {inStock ? "Còn hàng" : "Hết hàng"}
  </div>
);

const ProductRating = ({ rating }: { rating: number }) => (
  <div
    className="
    flex mb-2 text-left w-full
    text-[10px] md:text-[11px] lg:text-xs
  "
  >
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

const ProductPrice = ({
  priceOld,
  priceNew,
}: {
  priceOld: string;
  priceNew: string;
}) => (
  <div
    className="
    text-xs md:text-sm lg:text-base mb-1 text-left w-full
  "
  >
    <span className="line-through text-gray-400 mr-2">
      {Number(priceOld).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      })}
    </span>
    <span className="text-red-600 font-bold text-sm md:text-base lg:text-lg md:block lg:inline">
      {Number(priceNew).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      })}
    </span>
  </div>
);

const ProductCard: React.FC<{ product: Product & { imageHover?: string } }> = ({
  product,
}) => (
  <div
    className="
    bg-white rounded-xl border border-gray-100 flex flex-col relative transition-shadow duration-200 hover:shadow-2xl
    md:max-w-[180px] md:min-w-[140px] md:h-[320px]
    lg:max-w-[300px] lg:min-w-[222px] lg:h-[398px]
    xl:max-w-[300px] xl:min-w-[222px] xl:h-[398px]
    w-full
    "
  >
    <div className="relative">
      <ProductImage
        src={product.image}
        alt={product.label}
        hoverSrc={product.imageHover}
      />
      <ProductBadge percent={product.percent} />
    </div>
    <div className="flex-1 flex flex-col justify-start items-start w-full px-2 md:px-3 lg:px-4">
      <ProductLabel label={product.label} />
      {/* Stock & Rating: md thì cạnh nhau, lg trở lên thì xuống dòng */}
      <div className="flex flex-col md:flex-row lg:flex-col md:items-center w-full">
        <ProductStock inStock={product.inStock} />
        <ProductRating rating={product.rating} />
      </div>
      <ProductPrice priceOld={product.priceOld} priceNew={product.priceNew} />
    </div>
  </div>
);

export default ProductCard;
