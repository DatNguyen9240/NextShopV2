"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const images = [
  "/sell_off/01.jpg",
  "/sell_off/02.jpg",
  "/sell_off/03.jpg",
  "/sell_off/02.jpg",
];

const WIDTH = 1280;
const HEIGHT = 369;

const Carousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearTimeout(timer);
  }, [activeIndex]);

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
      className="relative mx-auto rounded-xl mt-5"
      style={{ width: WIDTH, height: HEIGHT }}
    >
      {/* Slide container */}
      <div
        className="flex transition-transform duration-700 ease-in-out gap-4"
        style={{
          width: WIDTH * images.length,
          transform: `translateX(-${activeIndex * WIDTH}px)`,
          height: HEIGHT,
        }}
      >
        {images.map((src, idx) => (
          <div key={idx} style={{ width: WIDTH, height: HEIGHT }}>
            <Image
              src={src}
              alt={`slide-${idx}`}
              width={WIDTH}
              height={HEIGHT}
              className="object-cover w-full h-full rounded-xl"
              draggable={false}
              loading={idx === activeIndex ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Prev Button */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold transition"
        aria-label="Previous"
      >
        &#8249;
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold transition"
        aria-label="Next"
      >
        &#8250;
      </button>

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
};

export default Carousel;
