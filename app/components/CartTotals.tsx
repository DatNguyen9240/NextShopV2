"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";
import MoneyVND from "./MoneyVND";
import { useCart } from "@/app/context/CartContext";

const CartTotals: React.FC = () => {
  const router = useRouter();
  const { cart, loading } = useCart();

  const total = cart?.totalAmount ?? 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-5 w-full max-w-xs shadow flex flex-col gap-2">
        <h3 className="text-lg font-bold text-gray-800 mb-2">TỔNG GIỎ HÀNG</h3>
        <div className="py-6 text-center">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-5 w-full max-w-xs shadow flex flex-col gap-2">
      <h3 className="text-lg font-bold text-gray-800 mb-2">TỔNG GIỎ HÀNG</h3>
      <hr className="mb-2" />
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-700">Tạm tính</span>
        <MoneyVND value={total} color="text-pink-600" className="text-lg" />
      </div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-700">Phí vận chuyển</span>
        <span className="font-semibold text-black">Miễn phí</span>
      </div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-700">Dự kiến giao tại</span>
        <span className="font-semibold text-black">Việt Nam</span>
      </div>
      <div className="flex justify-between items-center mt-2 mb-3">
        <span className="text-gray-700 font-bold">Tổng cộng</span>
        <MoneyVND value={total} color="text-pink-600" className="text-lg" />
      </div>
      <Button
        shape="rounded"
        size="md"
        className="bg-pink-600 hover:bg-pink-700 text-white w-full flex items-center justify-center font-semibold text-base py-2 mt-2"
        icon={<span className="text-xl mr-2">🛒</span>}
        onClick={() => router.push('/checkout')}
      >
        Thanh toán
      </Button>
    </div>
  );
};

export default CartTotals;
