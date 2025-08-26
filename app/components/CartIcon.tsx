import React from "react";

const CartIcon = React.memo(function CartIcon() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="#222"
      strokeWidth="2"
      viewBox="0 0 24 24"
      className=""
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
});

export default CartIcon;
