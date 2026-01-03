import Image from "next/image";
import { useState } from "react";
import ImageLightbox from "@/app/components/ImageLightbox";


type ProductImagesProps = { images?: string[]; badgePercent?: string; selectedIndex?: number; onSelect?: (idx: number) => void };

export default function ProductImages(props: ProductImagesProps) {
  const { images, selectedIndex = 0, onSelect } = props;
  const isLoading = typeof images === "undefined";

  // Hooks must be called unconditionally at the top level of the component
  const [showLightbox, setShowLightbox] = useState(false);
  const [initialLightboxIndex, setInitialLightboxIndex] = useState<number>(0);

  const thumbs = !isLoading && images && images.length > 0 ? images : [];
  const main = thumbs.length > 0 && Math.max(0, Math.min(selectedIndex, thumbs.length - 1)) >= 0 ? thumbs[selectedIndex] : null;

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
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src={main}
            alt="Product"
            width={420}
            height={420}
            className="object-cover w-full h-full rounded-xl absolute top-0 left-0 z-10 transition-transform duration-500 group-hover:scale-110"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      );
    }

    if (thumbs.length > 0) {
      return (
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src={thumbs[0]}
            alt="Product"
            width={420}
            height={420}
            className="object-cover w-full h-full rounded-xl absolute top-0 left-0 z-10 transition-transform duration-500 group-hover:scale-110"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  };

  const openLightbox = (idx = 0) => {
    setInitialLightboxIndex(idx);
    setShowLightbox(true);
  };

  return (
    <div>
      <div onClick={() => openLightbox(selectedIndex)} className="relative max-w-[480px] h-[420px] mx-2 sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] lg:w-[460px] lg:h-[420px] rounded-xl overflow-hidden mb-3 group cursor-zoom-in">
        {renderMain()}
        {thumbs.length > 0 && (
          <div className="absolute left-3 top-3 bg-black/60 text-white text-xs rounded-full px-2 py-0.5 z-30">
            {selectedIndex + 1}/{thumbs.length}
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap ml-2">
        {thumbs.length > 0 ? (
          thumbs.map((src, idx) => (
            <button key={idx} onClick={() => { if (onSelect) onSelect(idx); }} className={`border rounded-lg p-0 ${idx === selectedIndex ? 'ring-2 ring-pink-500' : ''}`}>
              <Image
                src={src}
                alt={`Thumb ${idx}`}
                width={80}
                height={80}
                className="object-cover w-[70px] h-[80px] sm:w-[64px] sm:h-[64px] md:w-[72px] md:h-[72px] lg:w-[94px] lg:h-[80px] rounded-lg"
                style={{ objectFit: "cover" }}
              />
            </button>
          ))
        ) : (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-[70px] h-[80px] sm:w-[64px] sm:h-[64px] md:w-[72px] md:h-[72px] lg:w-[94px] lg:h-[80px] rounded-lg bg-gray-100 border flex items-center justify-center text-gray-300">—</div>
          ))
        )}
      </div>

      {showLightbox && (
        <ImageLightbox images={thumbs} initialIndex={initialLightboxIndex} onClose={() => setShowLightbox(false)} />
      )}
    </div>
  );
}
