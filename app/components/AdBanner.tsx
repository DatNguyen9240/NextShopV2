import React from "react";
import Image from "next/image";

const AdBanner: React.FC = () => (
  <div className="flex flex-col gap-6 hidden xl:flex" style={{ width: 260 }}>
    <Image
      src="/sell_off/01.jpg"
      alt="Sale up to 50%"
      width={252}
      height={352}
      className="rounded-xl w-full h-[352px] object-cover mb-4"
      priority
    />
    <Image
      src="/sell_off/02.jpg"
      alt="Grocery Sale"
      width={260}
      height={400}
      className="rounded-xl w-full h-[400px] object-cover"
      priority
    />
  </div>
);

export default AdBanner;
