"use client";

import { useRouter } from "next/navigation";
import { useState, use } from "react";
import SectionTitle from "@/app/components/SectionTitle";
import {
  ProductRating,
  ProductPrice,
  ProductBadge,
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
import Image from "next/image";

export default function ProductModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [selectedSize, setSelectedSize] = useState("M"); // Trạng thái cho size được chọn
  const [quantity, setQuantity] = useState(1);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]"
      onClick={() => router.back()}
    >
      <div
        className="bg-white rounded-lg w-[960px] h-[600px] max-w-full max-h-full p-6 shadow-lg relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="w-full">
            <SectionTitle>
              A-Line Kurti With Sharara & DupattaA-Line Kurti
            </SectionTitle>
            <div className="-mt-6">
              <div className="text-gray-600">
                Brands: <span className="font-semibold">Sangria</span>
              </div>
              <ProductRating rating={4} />
            </div>
            <hr className="my-2 border-t border-gray-200" />{" "}
            {/* Đường line mỏng dài hết ngang */}
          </div>
          <ButtonClose
            onClick={() => router.back()}
            className="absolute right-4 top-4 z-20"
          />
        </div>
        <hr className="mb-4" />

        {/* Main content */}
        <div className="flex gap-8 flex-wrap">
          {/* Image & thumbnails */}
          <div>
            <div className="relative w-[340px] h-[360px] rounded-xl overflow-hidden mb-3">
              <Image
                src="/sell_off/01.jpg"
                alt="Product"
                width={340}
                height={360}
                className="object-cover w-full h-full"
                style={{ objectFit: "cover" }}
                priority
              />
              <ProductBadge percent="8%" /> {/* dùng lại component này */}
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4].map((i) => (
                <Image
                  key={i}
                  src={`/sell_off/01.jpg`}
                  alt={`Thumb ${i}`}
                  width={80}
                  height={80}
                  className="object-cover w-20 h-20 rounded-lg border"
                  style={{ objectFit: "cover" }}
                />
              ))}
            </div>
          </div>
          {/* Info & actions */}
          <div className="flex-1 min-w-[250px] overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <ProductPrice
                priceOld="145000"
                priceNew="130000"
                className="text-2xl"
              />
            </div>
            <ProductStock inStock={true} bg />
            <p className="text-gray-700 mb-16">
              Rs: Lorem Ipsum is simply dummy text of the printing and
              typesetting industry. Lorem Ipsum has been the industry's standard
              dummy text ever since the 1500s, when an unknown printer took a
              galley of type ajnd scrambled it to make a type specimen book.
            </p>
            <div className="mb-4 flex items-center">
              <span className="mr-2 text-black">Size:</span>
              {["S", "M", "L", "XL"].map((size) => (
                <ButtonSize
                  key={size}
                  value={size}
                  selected={selectedSize === size}
                  onClick={() => setSelectedSize(size)}
                />
              ))}
            </div>
            <div className="flex items-center gap-4 my-6">
              <ButtonMinus
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              />
              <span className="mx-2 text-xl text-black">{quantity}</span>
              <ButtonPlus onClick={() => setQuantity((q) => q + 1)} />
              <AddToCartButton />
            </div>
            <div className="flex gap-3">
              <WishlistButton />
              <CompareButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
