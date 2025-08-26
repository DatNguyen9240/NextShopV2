import React from "react";

interface HotlineProps {
  phone: string;
}

const Hotline: React.FC<HotlineProps> = React.memo(function Hotline({ phone }) {
  return (
    <div className="flex flex-col items-end ml-4">
      <span className="text-[10px] text-gray-500 font-medium tracking-widest">
        HOTLINE:
      </span>
      <span className="font-bold text-base text-gray-900">{phone}</span>
    </div>
  );
});

export default Hotline;
