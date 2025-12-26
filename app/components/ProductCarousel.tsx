import React, { useState, useRef, useLayoutEffect } from "react";
import ProductCard from "./ProductCard";
import { ButtonPrev, ButtonNext } from "./Button";
import { useBreakpoint } from "@/app/hooks/useBreakpoint";
import { Product } from "./ProductCard";

type ProductCarouselProps = {
  products: Product[];
  cardConfig?: typeof CARD_CONFIG;
  slideStep?: number;
};

const CARD_CONFIG = {
  base: { cardWidth: 140 },
  sm: { cardWidth: 180 },
  md: { cardWidth: 220 },
  lg: { cardWidth: 240 },
  xl: { cardWidth: 240 },
};

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  cardConfig = CARD_CONFIG,
  slideStep = 2.25,
}) => {
  const [startIdx, setStartIdx] = useState(0);
  const breakpoint = useBreakpoint();
  const { cardWidth } = cardConfig[breakpoint];

  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselWidth, setCarouselWidth] = useState(1240);

  useLayoutEffect(() => {
    if (carouselRef.current) {
      setCarouselWidth(carouselRef.current.offsetWidth);
    }
  }, [breakpoint]);

  const visibleCount = Math.floor(carouselWidth / cardWidth);

  const handlePrev = () => setStartIdx((prev) => Math.max(prev - slideStep, 0));
  const handleNext = () =>
    setStartIdx((prev) =>
      Math.min(prev + slideStep, products.length - visibleCount)
    );

  return (
    <div className="relative" ref={carouselRef}>
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
        hidden={startIdx + visibleCount >= products.length - 1}
      />
    </div>
  );
};

export default ProductCarousel;
