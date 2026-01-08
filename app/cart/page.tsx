import React from "react";
import CartTable from "../components/CartTable";
import CartTotals from "../components/CartTotals";
import { CartProvider } from "../context/CartContext";

const CartPage: React.FC = () => {
  return (
    <CartProvider>
      <div className="w-full min-h-screen py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <CartTable />
          </div>
          <div className="w-full md:w-[340px] flex-shrink-0">
            <div className="sticky top-8">
              <CartTotals />
            </div>
          </div>
        </div>
      </div>
    </CartProvider>
  );
};

export default CartPage;
