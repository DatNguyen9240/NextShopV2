import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CarouselButtonProps = {
  onClick: () => void;
  direction: "prev" | "next";
  size?: "sm" | "md" | "lg";
  hidden?: boolean; // thêm prop này
};

const sizeMap = {
  sm: 36,
  md: 48,
  lg: 64,
};

const iconSizeMap = {
  sm: 16,
  md: 22,
  lg: 28,
};

const CarouselButton: React.FC<CarouselButtonProps> = ({
  onClick,
  direction,
  size = "md",
  hidden = false,
}) => {
  if (hidden) return null; // nếu hidden thì không render nút
  return (
    <button
      onClick={onClick}
      className={`absolute ${
        direction === "prev" ? "left-4" : "right-4"
      } top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 bg-white border rounded-full flex items-center justify-center hover:bg-gray-200`}
      aria-label={direction === "prev" ? "Prev" : "Next"}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        minWidth: sizeMap[size],
        minHeight: sizeMap[size],
        boxSizing: "border-box",
      }}
    >
      {direction === "prev" ? (
        <ChevronLeft size={iconSizeMap[size]} color="#6b7280" />
      ) : (
        <ChevronRight size={iconSizeMap[size]} color="#6b7280" />
      )}
    </button>
  );
};

export default CarouselButton;
