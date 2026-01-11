"use client";

import React from "react";
import { createPortal } from 'react-dom';
import ProductsTitle from "./ProductsTitle";
import { ButtonMinus, ButtonPlus, ButtonClose } from "./Button";
import Image from "next/image";
import MoneyVND from "./MoneyVND";
import { useCart } from "@/app/context/CartContext";
import { toast } from 'react-hot-toast';
import type { CartItemDto } from "@/app/types/cart";

type CartItemType = CartItemDto;
 

type TableHeaderProps = {
  columns: string[];
};

const TableHeader: React.FC<TableHeaderProps> = ({ columns }) => (
  <thead>
    <tr className="bg-gray-200">
      {columns.map((col, idx) => (
        <th
          key={col}
          className={`py-3 px-4 font-semibold ${
            idx === 0
              ? "text-black rounded-tl-xl rounded-bl-xl min-w-[240px] text-left"
              : idx === 1 || idx === 2 || idx === 3
              ? "text-black text-center"
              : idx === columns.length - 1
              ? "text-black rounded-tr-xl rounded-br-xl text-center"
              : "text-black text-center"
          }`}
        >
          {col}
        </th>
      ))}
    </tr>
  </thead>
);

const CartTableRow: React.FC<{ item: CartItemType; onChangeQty: (id: string, qty: number) => void; onRemove: (id: string) => void }> = ({ item, onChangeQty, onRemove }) => (
  <tr className="border-b">
    <td className="py-2 flex items-center gap-6 min-w-[300px]">
      <Image
        src={item.variantInfo?.imageUrl || '/sell_off/01.jpg'}
        alt={item.variantInfo?.productName || 'Product'}
        width={100}
        height={100}
        className="rounded"
        style={{ width: 'auto', height: 'auto' }}
        priority
      />
      <div>
        <div
          className="font-bold text-black max-w-[240px] overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
          }}
        >
          {item.variantInfo?.productName || 'Unknown Product'}
        </div>
        {/* Rating not available from cart items; keep space for future */}
        <div className="flex mt-1">
          <span className="text-sm text-gray-500">{item.variantInfo?.color ? `${item.variantInfo.color}${item.variantInfo.size ? ' • ' + item.variantInfo.size : ''}` : item.variantInfo?.size ?? ''}</span>
        </div>
      </div>
    </td>
    <td className="py-2 px-4 text-center">
      <MoneyVND value={item.unitPrice} color="text-pink-600" />
    </td>
    <td className="py-2 px-4 text-center text-black">
      <div className="flex items-center gap-2 justify-center">
        <ButtonMinus onClick={async () => { const newQty = Math.max(1, item.quantity - 1); onChangeQty(item.cartItemId, newQty); }} />
        <span className="px-2">{item.quantity}</span>
        <ButtonPlus onClick={async () => { const newQty = item.quantity + 1; onChangeQty(item.cartItemId, newQty); }} />
      </div>
    </td>
    <td className="py-2 px-4 text-center">
      <MoneyVND value={item.totalPrice} color="text-pink-600" />
    </td>
    <td className="py-2 px-4 text-center">
      <ButtonClose onClick={async () => onRemove(item.cartItemId)} />
    </td>
  </tr>
);

const CartTableBody: React.FC<{ items: CartItemType[]; onChangeQty: (id: string, qty: number) => void; onRemove: (id: string) => void }> = ({ items, onChangeQty, onRemove }) => (
  <tbody>
    {items.map((item) => (
      <CartTableRow key={item.cartItemId} item={item} onChangeQty={onChangeQty} onRemove={onRemove} />
    ))}
  </tbody>
);

const CartTable: React.FC = () => {
  const { cart, loading, updateItem, removeItem } = useCart();

  async function handleChangeQty(cartItemId: string, qty: number) {
    try {
      await updateItem(cartItemId, { quantity: qty });
    } catch (e) {
      console.error(e);
      toast.error('Cập nhật số lượng thất bại');
    }
  }

  async function performRemove(cartItemId: string) {
    try {
      await removeItem(cartItemId);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (e) {
      console.error(e);
      toast.error('Xóa thất bại');
    }
  }

  function handleRemove(cartItemId: string) {
    const container = typeof document !== 'undefined' ? document.body : (undefined as unknown as HTMLElement);
    toast.custom((t) => createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* backdrop */}
        <div className="absolute inset-0 bg-black/40" onClick={() => toast.dismiss(t.id)} />

        <div className="relative max-w-md w-full bg-white p-4 rounded shadow-lg z-10">
          <div className="text-sm">Xóa sản phẩm khỏi giỏ hàng?</div>
          <div className="mt-3 flex gap-2 justify-end">
            <button
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
              onClick={async () => { toast.dismiss(t.id); await performRemove(cartItemId); }}
            >
              Xóa
            </button>
            <button
              className="px-3 py-1 bg-gray-200 rounded text-sm"
              onClick={() => toast.dismiss(t.id)}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>,
      container
    ), { duration: 8000, id: `cart-delete-${cartItemId}` });
  }

  const items = cart?.items ?? [];

  return (
    <div className="w-full mx-auto mt-8 rounded-lg ">
      <ProductsTitle title="GIỎ HÀNG CỦA BẠN" />
      <div className="text-gray-700 mb-2 ml-1">
        Có <span className="text-pink-600 font-bold">{items.length}</span> sản
        phẩm trong giỏ hàng của bạn
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <TableHeader
            columns={["Sản phẩm", "Đơn giá", "Số lượng", "Tạm tính", "Xóa"]}
          />
          {loading ? (
            <tbody>
              <tr>
                <td colSpan={5} className="py-6 text-center">Đang tải giỏ hàng...</td>
              </tr>
            </tbody>
          ) : (
            <CartTableBody items={items} onChangeQty={handleChangeQty} onRemove={handleRemove} />
          )}
        </table>
      </div>
    </div>
  );
};

export default CartTable;
