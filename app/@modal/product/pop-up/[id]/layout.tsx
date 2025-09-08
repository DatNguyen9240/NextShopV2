"use client";

import { useRouter } from "next/navigation";

export default function ModalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]"
      onClick={() => router.back()}
    >
      <div
        className="bg-white rounded-lg w-[960px] h-[600px] max-w-full max-h-full p-6 shadow-lg relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
