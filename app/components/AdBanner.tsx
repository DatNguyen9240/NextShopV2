"use client";

import React from "react";
import Image from "next/image";
import { useAdvertisements } from "@/app/hooks/useAdvertisements";

type AdBannerProps = {
  type?: string;
  className?: string;
};

const DEFAULT_WIDTH = 260;

const AdBanner: React.FC<AdBannerProps> = ({ type = "home_sidebar", className }) => {
  const { images, loading } = useAdvertisements(type);

  // hide until the API returns items
  if (loading || !images || images.length === 0) return null;

  return (
    <div className={`flex flex-col gap-6 hidden xl:flex ${className ?? ''}`} style={{ width: DEFAULT_WIDTH }}>
      {images.slice(0, 2).map((src, idx) => {
        const height = idx === 0 ? 352 : 400;
        return (
          <div key={idx} className="relative rounded-xl overflow-hidden" style={{ width: DEFAULT_WIDTH, height }}>
            <Image src={src} alt={`ad-${idx}`} fill sizes="260px" className="object-cover" priority={idx === 0} />
          </div>
        );
      })}
    </div>
  );
};

export default AdBanner;
