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
import { Product } from "./ProductCard";
import { Expand } from "lucide-react";
import { WishlistButton } from "./Button";
import { useRouter } from "next/navigation";

const ProductCardHorizontal: React.FC<{
  product: Product;
  className?: string;
}> = ({ product, className = "" }) => {
  const router = useRouter();

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, originX: 0, originY: 0 }}
      animate={{ scale: 1, originX: 0, originY: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={`bg-white rounded-xl border border-gray-100 flex flex-row items-center relative transition-shadow duration-200 hover:shadow-2xl w-full max-w-full min-h-[120px] p-2 ${className}`}
    >
      <div
        className="relative flex-shrink-0 w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] md:w-[180px] md:h-[180px] max-w-full group cursor-pointer rounded-lg overflow-hidden"
        onClick={() => product.id && router.push(`/product/${product.id}`)}
      >
        <Image
          src={product.image}
          alt={product.label}
          fill
          className="object-cover rounded-lg"
          sizes="(min-width:768px) 180px, (min-width:640px) 140px, 100px"
          priority
        />

        {/* overlay actions (appear on hover) */}
        <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40">
          <button
            className="flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 bg-white rounded-full shadow flex items-center justify-center w-8 h-8"
            onClick={(e) => {
              e.stopPropagation();
              if (product.id) router.push(`/product/pop-up/${product.id}`);
            }}
            title="Xem chi tiết"
          >
            <Expand size={18} strokeWidth={1} color="#222" />
          </button>
          <div className="bg-white rounded-full shadow flex items-center justify-center w-8 h-8">
            <WishlistButton productId={product.id} className="w-8 h-8 p-0" showText={false} />
          </div>
        </div>

        <ProductBadge percent={product.percent} />
      </div>

      <div className="flex-1 flex flex-col justify-center items-start px-2 py-1 sm:px-4 sm:py-2 min-w-0">
        <div className="font-semibold text-gray-800 mb-1 text-left w-full text-[13px] sm:text-base truncate">
          {product.label}
        </div>
        {(() => {
          const stockCount = product.totalStockQuantity ?? (product.inStock ? 1 : 0);
          const displayCount = typeof product.totalStockQuantity === 'number' ? product.totalStockQuantity : undefined;
          return <ProductStock inStock={stockCount > 0} count={displayCount ?? null} />;
        })()}
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
};

export default ProductCardHorizontal;
