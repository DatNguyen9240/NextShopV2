"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ButtonPrev, ButtonNext } from "./Button";
import CarouselIndicator from "./CarouselIndicator";
import { useBreakpoint } from "@/app/hooks/useBreakpoint";

const images = ["/sell_off/01.jpg", "/sell_off/02.jpg", "/sell_off/03.jpg"];

const WIDTHS = {
  base: 320,
  sm: 200,
  md: 435,
  lg: 1024,
  xl: 1280,
} as const;

const HEIGHTS = {
  base: 160,
  sm: 100,
  md: 220,
  lg: 369,
  xl: 369,
} as const;

type CarouselProps = {
  timeout?: number;
  showIndicator?: boolean;
  className?: string;
  size?: "base" | "sm" | "md" | "lg" | "xl";
};

const Carousel: React.FC<CarouselProps> = React.memo(function Carousel({
  timeout = 0,
  showIndicator = true,
  className,
  size,
}) {
  const detectedBreakpoint = useBreakpoint();
  const breakpoint = size ?? detectedBreakpoint;
  const width = WIDTHS[breakpoint];
  const height = HEIGHTS[breakpoint];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!timeout) return;
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, timeout);
    return () => clearTimeout(timer);
  }, [activeIndex, timeout]);

  const prevSlide = () =>
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const goToSlide = (idx: number) => setActiveIndex(idx);

  return (
    <div
      className={`relative rounded-xl mt-5 max-w-7xl xl:overflow-visible overflow-hidden ${
        className ?? ""
      }`}
    >
      {/* Slide container */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          width: width * images.length,
          transform: `translateX(-${activeIndex * width}px)`,
          height,
        }}
      >
        {images.map((src, idx) => (
          <div
            key={idx}
            style={{ width, height }}
            className="flex-shrink-0 px-2"
          >
            <Image
              src={src}
              alt={`slide-${idx}`}
              width={width}
              height={height}
              className="object-cover w-full h-full rounded-xl"
              draggable={false}
              loading={idx === activeIndex ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Chỉ hiện nút khi showIndicator true */}
      {showIndicator && (
        <>
          <ButtonPrev onClick={prevSlide} />
          <ButtonNext onClick={nextSlide} />
        </>
      )}

      {/* Indicator */}
      {showIndicator && (
        <CarouselIndicator
          count={images.length}
          activeIndex={activeIndex}
          onSelect={goToSlide}
        />
      )}
    </div>
  );
});

export default Carousel;
