import React, { useState } from "react";
import ProductCard from "./ProductCard";
import { ButtonPrev, ButtonNext } from "./Button";
import { useBreakpoint } from "@/app/hooks/useBreakpoint";

type Product = {
  id: string;
  label: string;
  priceOld: string;
  priceNew: string;
  percent: string;
  inStock: boolean;
  image: string;
  imageHover?: string;
  rating: number;
};

type ProductCarouselProps = {
  products: Product[];
  cardConfig?: typeof CARD_CONFIG;
};

const CARD_CONFIG = {
  base: { cardWidth: 160, step: 1.5 },
  sm: { cardWidth: 180, step: 1.5 },
  md: { cardWidth: 220, step: 1.5 },
  lg: { cardWidth: 240, step: 2.75 },
  xl: { cardWidth: 240, step: 2.75 },
};

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  cardConfig = CARD_CONFIG,
}) => {
  const [startIdx, setStartIdx] = useState(0);
  const breakpoint = useBreakpoint();
  const { cardWidth, step } = cardConfig[breakpoint];

  const handlePrev = () => setStartIdx((prev) => Math.max(prev - step, 0));
  const handleNext = () =>
    setStartIdx((prev) => Math.min(prev + step, products.length - 4));

  return (
    <div className="relative">
      <div
        className="flex gap-4 transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateX(-${startIdx * cardWidth}px)`,
        }}
      >
        {products.map((p) => (
          <ProductCard product={p} key={p.id} />
        ))}
      </div>
      <ButtonPrev onClick={handlePrev} size={"md"} hidden={startIdx <= 0} />
      <ButtonNext
        onClick={handleNext}
        size={"md"}
        hidden={startIdx + 4 >= products.length}
      />
    </div>
  );
};

export default ProductCarousel;
