import Image from "next/image";
import { ProductBadge } from "@/app/components/ProductCard";

export default function ProductImages({ images }: { images?: string[] }) {
  const isLoading = typeof images === "undefined";
  const main = !isLoading && images && images.length > 0 ? images[0] : null;
  // Always show small thumbnails if at least one image exists (include main as a small thumb when only one)
  const thumbs = !isLoading && images && images.length > 0 ? images : [];

  // Loading skeleton
  if (isLoading) {
    return (
      <div>
        <div className="relative max-w-[400px] h-[350px] mx-2 sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] lg:w-[400px] lg:h-[360px] rounded-xl overflow-hidden mb-3 bg-gray-200 animate-pulse" />
        <div className="flex gap-2 flex-wrap ml-2 mt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[70px] h-[80px] sm:w-[64px] sm:h-[64px] md:w-[72px] md:h-[72px] lg:w-[94px] lg:h-[80px] rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // No main image but thumbs may exist - show neutral main placeholder and still render thumbs
  const renderMain = () => {
    if (main) {
      return (
        <Image
          src={main}
          alt="Product"
          width={360}
          height={360}
          className="object-cover w-full h-full"
          style={{ objectFit: "cover" }}
          priority
        />
      );
    }

    if (thumbs.length > 0) {
      // If no main but thumbs exist, promote first thumb to main view
      return (
        <Image
          src={thumbs[0]}
          alt="Product"
          width={360}
          height={360}
          className="object-cover w-full h-full"
          style={{ objectFit: "cover" }}
          priority
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  };

  return (
    <div>
      <div className="relative max-w-[400px] h-[350px] mx-2 sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] lg:w-[400px] lg:h-[360px] rounded-xl overflow-hidden mb-3">
        {renderMain()}
        <ProductBadge percent="8%" />
      </div>

      <div className="flex gap-2 flex-wrap ml-2">
        {thumbs.length > 0 ? (
          thumbs.map((src, idx) => (
            <Image
              key={idx}
              src={src}
              alt={`Thumb ${idx}`}
              width={80}
              height={80}
              className="object-cover w-[70px] h-[80px] sm:w-[64px] sm:h-[64px] md:w-[72px] md:h-[72px] lg:w-[94px] lg:h-[80px] rounded-lg border"
              style={{ objectFit: "cover" }}
            />
          ))
        ) : (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-[70px] h-[80px] sm:w-[64px] sm:h-[64px] md:w-[72px] md:h-[72px] lg:w-[94px] lg:h-[80px] rounded-lg bg-gray-100 border flex items-center justify-center text-gray-300">—</div>
          ))
        )}
      </div>
    </div>
  );
}
