import React from "react";

type CarouselIndicatorProps = {
  count: number;
  activeIndex: number;
  onSelect: (idx: number) => void;
};

const CarouselIndicator: React.FC<CarouselIndicatorProps> = ({
  count,
  activeIndex,
  onSelect,
}) => (
  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
    {Array.from({ length: count }).map((_, idx) => (
      <button
        key={idx}
        onClick={() => onSelect(idx)}
        className={`w-3 h-3 rounded-full transition-all duration-200 outline-none ${
          idx === activeIndex ? "bg-blue-500 scale-125" : "bg-gray-300"
        }`}
        aria-label={`Go to slide ${idx + 1}`}
      />
    ))}
  </div>
);

export default CarouselIndicator;
