"use client";
import React, { useState } from "react";
import Image from "next/image";
import { ButtonPrev, ButtonNext } from "./Button";

const banners = [
  "/sell_off/01.jpg",
  "/banners/banner2.jpg",
  "/banners/banner3.jpg",
];

const AdvertisementCarousel: React.FC = () => {
  const [active, setActive] = useState(0);

  const prev = () =>
    setActive((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  const next = () =>
    setActive((prev) => (prev === banners.length - 1 ? 0 : prev + 1));

  return (
    <div className="flex gap-4 w-full py-4 overflow-x-hidden">
      <div className="relative flex w-full">
        {banners.map((src, idx) => (
          <div
            key={idx}
            className={`transition-all duration-500 rounded-2xl overflow-hidden ${
              idx === active ? "block" : "hidden"
            } w-[340px] sm:w-[400px] md:w-[440px] lg:w-[480px] h-[140px] sm:h-[160px] md:h-[180px] lg:h-[200px]`}
            style={{ minWidth: "0" }}
          >
            <Image
              src={src}
              alt={`Banner ${idx + 1}`}
              width={480}
              height={200}
              className="w-full h-full object-cover rounded-2xl"
              priority={idx === active}
            />
          </div>
        ))}
        <ButtonPrev onClick={prev} size="md" />
        <ButtonNext onClick={next} size="md" />
      </div>
    </div>
  );
};

export default AdvertisementCarousel;
