"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ButtonPrev, ButtonNext } from "./Button";
import CarouselIndicator from "./CarouselIndicator";
import { useBreakpoint } from "@/app/hooks/useBreakpoint";
import { useAdvertisements } from "@/app/hooks/useAdvertisements";

// No fallback images: Carousel requires `images` prop to render slides.

const WIDTHS = {
  base: 320,
  sm: 200,
  md: 785,
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
  images?: string[];
  type?: string; // optional ad type to fetch images when `images` prop is not provided
};

const Carousel: React.FC<CarouselProps> = React.memo(function Carousel({
  timeout = 0,
  showIndicator = true,
  className,
  size,
  images,
  type,
}) {
  const detectedBreakpoint = useBreakpoint();
  const breakpoint = size ?? detectedBreakpoint;
  const width = WIDTHS[breakpoint];
  const height = HEIGHTS[breakpoint];

  const [activeIndex, setActiveIndex] = useState(0);

  // If `images` prop is not provided but a `type` is given, fetch images for that ad type
  const { images: adImages, loading: adsLoading } = useAdvertisements(type);
  const slides = images ?? (type ? (adImages ?? []) : []);

  // spacing between slides (px)
  const SLIDE_GAP = 16;
  const trackWidth = width * slides.length + SLIDE_GAP * Math.max(0, slides.length - 1);
  const slideOffset = activeIndex * (width + SLIDE_GAP);

  useEffect(() => {
    if (!timeout || slides.length === 0) return;
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, timeout);
    return () => clearTimeout(timer);
  }, [activeIndex, timeout, slides.length]);

  // If no slides to show, render loading skeleton when fetching by `type`, otherwise render nothing
  if (slides.length === 0) {
    if (type && adsLoading) {
      return (
        <div
          className={`relative rounded-xl mt-5 max-w-7xl xl:overflow-visible overflow-hidden ${
            className ?? ""
          }`}
        >
          <div className="rounded-xl bg-gray-100 animate-pulse" style={{ width, height }} />
        </div>
      );
    }
    return null;
  }

  const prevSlide = () =>
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % slides.length);
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
          width: trackWidth,
          transform: `translateX(-${slideOffset}px)`,
          height,
        }}
      >
        {slides.map((src, idx) => (
          <div
            key={idx}
            style={{ width, height, marginRight: idx === slides.length - 1 ? 0 : SLIDE_GAP }}
            className="flex-shrink-0 relative overflow-hidden rounded-xl"
          >
            {/* Use next/image `fill` so the image covers the container fully while keeping aspect ratio. */}
            <Image
              src={src}
              alt={`slide-${idx}`}
              fill
              className="object-cover"
              draggable={false}
              loading={idx === activeIndex ? "eager" : "lazy"}
              priority={idx === activeIndex}
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
          count={slides.length}
          activeIndex={activeIndex}
          onSelect={goToSlide}
        />
      )}
    </div>
  );
});

export default Carousel;
