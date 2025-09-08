import Image from "next/image";
import { ProductBadge } from "@/app/components/ProductCard";

export default function ProductImages() {
  return (
    <div>
      <div className="relative max-w-[400px] h-[350px] mx-2 sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] lg:w-[400px] lg:h-[360px] rounded-xl overflow-hidden mb-3">
        <Image
          src="/sell_off/01.jpg"
          alt="Product"
          width={360}
          height={360}
          className="object-cover w-full h-full"
          style={{ objectFit: "cover" }}
          priority
        />
        <ProductBadge percent="8%" />
      </div>
      <div className="flex gap-2 flex-wrap ml-2">
        {[1, 2, 3, 4].map((i) => (
          <Image
            key={i}
            src={`/sell_off/01.jpg`}
            alt={`Thumb ${i}`}
            width={80}
            height={80}
            className="object-cover w-[70px] h-[80px] sm:w-[64px] sm:h-[64px] md:w-[72px] md:h-[72px] lg:w-[94px] lg:h-[80px] rounded-lg border"
            style={{ objectFit: "cover" }}
          />
        ))}
      </div>
    </div>
  );
}
