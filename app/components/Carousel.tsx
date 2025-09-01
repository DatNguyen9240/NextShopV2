"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import CarouselButton from "./CarouselButton";
import CarouselIndicator from "./CarouselIndicator";

const images = [
  "/sell_off/01.jpg",
  "/sell_off/02.jpg",
  "/sell_off/03.jpg",
  "/sell_off/02.jpg",
];

const WIDTHS = {
  base: 320,
  sm: 360,
  md: 520,
  lg: 1280,
  xl: 1280,
} as const;

const HEIGHTS = {
  base: 160,
  sm: 240,
  md: 220,
  lg: 369,
  xl: 369,
} as const;

type Breakpoint = "base" | "sm" | "md" | "lg" | "xl";

function useBreakpoint(): Breakpoint {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize(); // chạy lần đầu
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (width < 640) return "base";
  if (width < 768) return "sm";
  if (width < 1024) return "md";
  if (width < 1280) return "lg";
  return "xl";
}

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
  const detectedBreakpoint = useBreakpoint(); // luôn gọi hook ở đầu
  const breakpoint = size ?? detectedBreakpoint; // dùng prop nếu có, không thì lấy từ hook
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
      className={`relative rounded-xl mt-5 max-w-7xl lg:overflow-visible overflow-hidden ${
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

      {/* Buttons */}
      <CarouselButton onClick={prevSlide} direction="prev" size="md" />
      <CarouselButton onClick={nextSlide} direction="next" size="md" />

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
