"use client";
import React, { useState } from "react";

const PriceFilter: React.FC = () => {
  const minLimit = 100000;
  const maxLimit = 6000000;
  const step = 10000;

  const [min, setMin] = useState(100000);
  const [max, setMax] = useState(6000000);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), max - step);
    setMin(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), min + step);
    setMax(value);
  };

  return (
    <div>
      <h2 className="font-semibold mb-4 text-sm text-gray-800">LỌC THEO GIÁ</h2>
      <div className="relative w-full h-6">
        {/* Track background */}
        <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 bg-gray-300 rounded-full">
          <div
            className="absolute h-2 bg-purple-600 rounded-full"
            style={{
              left: `${(min / maxLimit) * 100}%`,
              right: `${100 - (max / maxLimit) * 100}%`,
            }}
          ></div>
        </div>

        {/* Input min */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={min}
          onChange={handleMinChange}
          className="absolute w-full h-6 appearance-none bg-transparent z-30 pointer-events-none
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:bg-purple-600
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:pointer-events-auto
                     [&::-webkit-slider-thumb]:mt-[-2px]   /* dịch xuống nhẹ */
                     [&::-moz-range-thumb]:w-4
                     [&::-moz-range-thumb]:h-4
                     [&::-moz-range-thumb]:bg-purple-600
                     [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:pointer-events-auto
                     [&::-moz-range-thumb]:transform
                     [&::-moz-range-thumb]:translate-y-[-2px]"
        />

        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={max}
          onChange={handleMaxChange}
          className="absolute w-full h-6 appearance-none bg-transparent z-20 pointer-events-none
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:bg-purple-600
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:pointer-events-auto
                     [&::-webkit-slider-thumb]:mt-[-2px]
                     [&::-moz-range-thumb]:w-4
                     [&::-moz-range-thumb]:h-4
                     [&::-moz-range-thumb]:bg-purple-600
                     [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:pointer-events-auto
                     [&::-moz-range-thumb]:transform
                     [&::-moz-range-thumb]:translate-y-[-2px]"
        />
      </div>

      <div className="flex justify-between mt-4 text-sm text-gray-900">
        <span>
          Từ:{" "}
          <span className="font-semibold">{min.toLocaleString("vi-VN")} ₫</span>
        </span>
        <span>
          Đến:{" "}
          <span className="font-semibold">{max.toLocaleString("vi-VN")} ₫</span>
        </span>
      </div>
    </div>
  );
};

export default PriceFilter;
