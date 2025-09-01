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

type CarouselProps = {
  timeout?: number; // Thời gian chuyển slide tự động (ms)
  showIndicator?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string; // thêm prop này
};

const SIZE_MAP = {
  sm: { width: 320, height: 160 },
  md: { width: 520, height: 220 },
  lg: { width: 1280, height: 369 },
  xl: { width: 1536, height: 480 },
};

const Carousel: React.FC<CarouselProps> = React.memo(function Carousel({
  timeout = 0,
  showIndicator = true,
  size = "lg",
  className,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!timeout) return;
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, timeout);
    return () => clearTimeout(timer);
  }, [activeIndex, timeout]);

  const { width, height } = SIZE_MAP[size];

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (idx: number) => {
    setActiveIndex(idx);
  };

  return (
    <div
      className={`relative rounded-xl mt-5 max-w-7xl overflow-hidden lg:overflow-visible ${
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
          <div className="lg:px-2" key={idx} style={{ width, height }}>
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
      <CarouselButton onClick={prevSlide} direction="prev" size="md" />
      <CarouselButton onClick={nextSlide} direction="next" size="md" />
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
