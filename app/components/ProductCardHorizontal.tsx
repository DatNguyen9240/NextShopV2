"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ProductBadge,
  ProductStock,
  ProductRating,
  ProductPrice,
} from "./ProductCard";

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

const ProductCardHorizontal: React.FC<{
  product: Product;
  className?: string;
}> = ({ product, className = "" }) => (
  <motion.div
    layout
    initial={{ scale: 0.8, originX: 0, originY: 0 }}
    animate={{ scale: 1, originX: 0, originY: 0 }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
    className={`bg-white rounded-xl border border-gray-100 flex flex-row items-center relative transition-shadow duration-200 hover:shadow-2xl w-full max-w-full min-h-[120px] p-2 ${className}`}
  >
    <div className="relative flex-shrink-0 w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] md:w-[180px] md:h-[180px] max-w-full">
      <Image
        src={product.image}
        alt={product.label}
        fill
        className="object-cover rounded-lg"
        sizes="100vw"
        priority
      />
      <ProductBadge percent={product.percent} />
    </div>
    <div className="flex-1 flex flex-col justify-center items-start px-2 py-1 sm:px-4 sm:py-2 min-w-0">
      <div className="font-semibold text-gray-800 mb-1 text-left w-full text-[13px] sm:text-base truncate">
        {product.label}
      </div>
      <ProductStock inStock={product.inStock} />
      <ProductRating
        rating={product.rating}
        className="mb-2 text-[15px] sm:text-[18px]"
      />
      <ProductPrice
        priceOld={product.priceOld}
        priceNew={product.priceNew}
        className="text-[13px] sm:text-base"
      />
    </div>
  </motion.div>
);

export default ProductCardHorizontal;
