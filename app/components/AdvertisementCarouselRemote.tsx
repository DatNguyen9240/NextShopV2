"use client";
import React from "react";
import Carousel from "./Carousel";
import { useAdvertisements } from "@/app/hooks/useAdvertisements";

type Props = {
  type?: string;
  timeout?: number;
};

const AdvertisementCarouselRemote: React.FC<Props> = ({ type = "sell_off", timeout = 4000 }) => {
  const { images, loading } = useAdvertisements(type);

  if (loading) return <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />;

  return <Carousel images={images} timeout={timeout} className="mx-auto" />;
};

export default AdvertisementCarouselRemote;
