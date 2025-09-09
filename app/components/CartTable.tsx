import React from "react";
import ProductsTitle from "./ProductsTitle";
import { ButtonMinus, ButtonPlus, ButtonClose } from "./Button";
import Image from "next/image";
import MoneyVND from "./MoneyVND";

type CartItemType = {
  id: string;
  label: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
  rating: number;
};

const cartItems: CartItemType[] = [
  {
    id: "1",
    label:
      "Áo thun GESPO Black & Teal Blue siêu đẹp siêu hot siêu chất lượng ...",
    image: "/sell_off/01.jpg",
    price: 399000,
    quantity: 3,
    subtotal: 1197000,
    rating: 3,
  },
  {
    id: "2",
    label: "Áo sơ mi nam Alias-N Regular Fit Spread...",
    image: "/sell_off/02.jpg",
    price: 298000,
    quantity: 1,
    subtotal: 298000,
    rating: 4,
  },
  {
    id: "3",
    label: "Quần jeans nam cao cấp",
    image: "/sell_off/03.jpg",
    price: 499000,
    quantity: 2,
    subtotal: 998000,
    rating: 5,
  },
  {
    id: "4",
    label: "Giày sneaker thể thao",
    image: "/sell_off/04.jpg",
    price: 799000,
    quantity: 1,
    subtotal: 799000,
    rating: 4,
  },
  {
    id: "5",
    label: "Áo khoác bomber thời trang",
    image: "/sell_off/05.jpg",
    price: 650000,
    quantity: 1,
    subtotal: 650000,
    rating: 5,
  },
  {
    id: "6",
    label: "Quần short nam mùa hè",
    image: "/sell_off/06.jpg",
    price: 259000,
    quantity: 2,
    subtotal: 518000,
    rating: 4,
  },
  {
    id: "7",
    label: "Áo hoodie unisex",
    image: "/sell_off/07.jpg",
    price: 499000,
    quantity: 1,
    subtotal: 499000,
    rating: 5,
  },
  {
    id: "8",
    label: "Giày lười nam cao cấp",
    image: "/sell_off/08.jpg",
    price: 899000,
    quantity: 1,
    subtotal: 899000,
    rating: 4,
  },
  {
    id: "9",
    label: "Áo sơ mi nữ công sở",
    image: "/sell_off/09.jpg",
    price: 349000,
    quantity: 2,
    subtotal: 698000,
    rating: 5,
  },
  {
    id: "10",
    label: "Quần tây nam lịch lãm",
    image: "/sell_off/10.jpg",
    price: 599000,
    quantity: 1,
    subtotal: 599000,
    rating: 4,
  },
];

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

const CartTableRow: React.FC<{ item: CartItemType }> = ({ item }) => (
  <tr className="border-b">
    <td className="py-2 flex items-center gap-6 min-w-[300px]">
      <Image
        src={item.image}
        alt={item.label}
        width={100}
        height={100}
        className="rounded"
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
          {item.label}
        </div>
        <div className="flex mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={i < item.rating ? "text-yellow-400" : "text-gray-300"}
            >
              ★
            </span>
          ))}
        </div>
      </div>
    </td>
    <td className="py-2 px-4 text-center">
      <MoneyVND value={item.price} color="text-pink-600" />
    </td>
    <td className="py-2 px-4 text-center text-black">
      <div className="flex items-center gap-2 justify-center">
        <ButtonMinus />
        <span className="px-2">{item.quantity}</span>
        <ButtonPlus />
      </div>
    </td>
    <td className="py-2 px-4 text-center">
      <MoneyVND value={item.subtotal} color="text-pink-600" />
    </td>
    <td className="py-2 px-4 text-center">
      <ButtonClose />
    </td>
  </tr>
);

const CartTableBody: React.FC<{ items: CartItemType[] }> = ({ items }) => (
  <tbody>
    {items.map((item) => (
      <CartTableRow key={item.id} item={item} />
    ))}
  </tbody>
);

const CartTable: React.FC = () => (
  <div className="w-full mx-auto mt-8 rounded-lg ">
    <ProductsTitle title="GIỎ HÀNG CỦA BẠN" />
    <div className="text-gray-700 mb-2 ml-1">
      Có <span className="text-pink-600 font-bold">{cartItems.length}</span> sản
      phẩm trong giỏ hàng của bạn
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <TableHeader
          columns={["Sản phẩm", "Đơn giá", "Số lượng", "Tạm tính", "Xóa"]}
        />
        <CartTableBody items={cartItems} />
      </table>
    </div>
  </div>
);

export default CartTable;
