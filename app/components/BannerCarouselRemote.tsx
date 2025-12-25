"use client";
import React from "react";
import Carousel from "./Carousel";
import { useBanners } from "@/app/hooks/useBanners";

type Props = {
  type?: string;
  timeout?: number;
};

const BannerCarouselRemote: React.FC<Props> = ({ type = "sell_off", timeout = 4000 }) => {
  const { images, loading } = useBanners(type);

  if (loading) return <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />;

  return <Carousel images={images} timeout={timeout} className="mx-auto" />;
};

export default BannerCarouselRemote;
