"use client";
import React from "react";

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
  "
  >
    {percent}
  </span>
);

const ProductImage = ({ src, alt }: { src: string; alt: string }) => (
  <img
    src={src}
    alt={alt}
    className="
      w-full object-cover mb-6 rounded-t-lg
      h-[120px] sm:h-[160px] md:h-[200px] lg:h-[220px] xl:h-[240px]
    "
  />
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
    <span className="text-red-600 font-bold text-sm md:text-base lg:text-lg">
      {Number(priceNew).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      })}
    </span>
  </div>
);

const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
  <div
    className="
    bg-white rounded-xl border border-gray-100 flex flex-col relative transition-shadow duration-200 hover:shadow-2xl
    md:max-w-[180px] md:min-w-[140px] md:h-[320px]
    lg:max-w-[300px] lg:min-w-[222px] lg:h-[398px]
    xl:max-w-[300px] xl:min-w-[222px] xl:h-[398px]
    w-full
  "
  >
    <ProductBadge percent={product.percent} />
    <ProductImage src={product.image} alt={product.label} />
    <div className="flex-1 flex flex-col justify-start items-start w-full px-2 md:px-3 lg:px-4">
      <ProductLabel label={product.label} />
      <ProductStock inStock={product.inStock} />
      <ProductRating rating={product.rating} />
      <ProductPrice priceOld={product.priceOld} priceNew={product.priceNew} />
    </div>
  </div>
);

export default ProductCard;
