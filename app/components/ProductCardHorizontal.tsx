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
    className={`bg-white rounded-xl border border-gray-100 flex flex-row items-center relative transition-shadow duration-200 hover:shadow-2xl w-full min-h-[120px] p-2 ${className}`}
    style={{ maxWidth: "100%" }}
  >
    <div className="relative flex-shrink-0 w-[120px] h-[120px] md:w-[160px] md:h-[160px] lg:w-[180px] lg:h-[180px] xl:w-[200px] xl:h-[200px]">
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
    <div className="flex-1 flex flex-col justify-center items-start px-4 py-2">
      <div className="font-semibold text-gray-800 mb-1 text-left w-full text-base truncate">
        {product.label}
      </div>
      <ProductStock inStock={product.inStock} />
      <ProductRating rating={product.rating} className="mb-2" />
      <ProductPrice priceOld={product.priceOld} priceNew={product.priceNew} />
    </div>
  </motion.div>
);

export default ProductCardHorizontal;
