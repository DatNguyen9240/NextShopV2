"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import CarouselButton from "./CarouselButton";

const images = [
  "/sell_off/01.jpg",
  "/sell_off/02.jpg",
  "/sell_off/03.jpg",
  "/sell_off/02.jpg",
];

// Responsive width & height
const WIDTHS = {
  base: 240,
  sm: 360,
  md: 520,
  lg: 1280,
  xl: 1536,
};
const HEIGHTS = {
  base: 160,
  sm: 240,
  md: 220,
  lg: 369,
  xl: 480,
};

function getResponsiveSize() {
  if (typeof window === "undefined")
    return { width: WIDTHS.lg, height: HEIGHTS.lg };
  const w = window.innerWidth;
  if (w < 640) return { width: WIDTHS.base, height: HEIGHTS.base };
  if (w < 960) return { width: WIDTHS.sm, height: HEIGHTS.sm };
  if (w < 1280) return { width: WIDTHS.md, height: HEIGHTS.md };
  return { width: WIDTHS.lg, height: HEIGHTS.lg };
}

const Carousel = React.memo(function Carousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [size, setSize] = useState(getResponsiveSize());

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  useEffect(() => {
    function handleResize() {
      setSize(getResponsiveSize());
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (idx: number) => {
    setActiveIndex(idx);
  };

  // Xác định size cho nút theo breakpoint
  const getButtonSize = () => {
    if (size.width <= WIDTHS.base) return "sm";
    if (size.width <= WIDTHS.sm) return "sm";
    if (size.width <= WIDTHS.md) return "md";
    return "lg";
  };

  return (
    <div
      className="relative mx-auto rounded-xl mt-5 w-full"
      style={{ maxWidth: size.width, height: size.height }}
    >
      {/* Slide container */}
      <div
        className="flex transition-transform duration-700 ease-in-out gap-4"
        style={{
          width: size.width * images.length,
          transform: `translateX(-${activeIndex * size.width}px)`,
          height: size.height,
        }}
      >
        {images.map((src, idx) => (
          <div key={idx} style={{ width: size.width, height: size.height }}>
            <Image
              src={src}
              alt={`slide-${idx}`}
              width={size.width}
              height={size.height}
              className="object-cover w-full h-full rounded-xl"
              draggable={false}
              loading={idx === activeIndex ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Prev Button */}
      <CarouselButton
        onClick={prevSlide}
        direction="prev"
        size={getButtonSize()}
      />

      {/* Next Button */}
      <CarouselButton
        onClick={nextSlide}
        direction="next"
        size={getButtonSize()}
      />

      {/* Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-200 outline-none ${
              idx === activeIndex ? "bg-blue-500 scale-125" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
});

export default Carousel;
