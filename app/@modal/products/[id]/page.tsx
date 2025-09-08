"use client";

import { useState, use } from "react";
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

function ProductInfo({ id }: { id: string }) {
  return (
    <>
      <SectionTitle>
        <span className="text-xl md:text-2xl">
          A-Line Kurti With Sharara & Dupatta - {id}
        </span>
      </SectionTitle>
      <div className="-mt-6 mb-2">
        <div className="text-gray-600">
          Brands: <span className="font-semibold">Sangria</span>
        </div>
        <ProductRating rating={4} />
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
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  return (
    <>
      {isModal && (
        <div className="flex justify-between items-start">
          <div className="w-full">
            <ProductInfo id={id} />
            <hr className="my-2 border-t border-gray-200" />
          </div>
          <ButtonClose
            className="absolute right-4 top-4 z-20"
            onClick={() => router.back()}
          />
        </div>
      )}
      {isModal && <hr className="mb-4" />}

      <div className="flex md:gap-4 xl:gap-18 flex-wrap">
        <ProductImages />
        <div className="flex-1 min-w-[250px] overflow-hidden">
          {!isModal && <ProductInfo id={id} />}
          <div className="flex items-center gap-3 mb-2">
            <ProductPrice
              priceOld="145000"
              priceNew="130000"
              className="text-2xl"
            />
          </div>
          <ProductStock inStock={true} bg />
          <p className="text-gray-700 mb-16">
            Rs: Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry standard dummy text ever
            since the 1500s, when an unknown printer took a galley of type ajnd
            scrambled it to make a type specimen book.
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
    </>
  );
}
