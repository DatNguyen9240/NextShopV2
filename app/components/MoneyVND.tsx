import React from "react";
import { formatVND } from "../utils/priceUtils";
type MoneyVNDProps = {
  value: string | number;
  className?: string;
  color?: string;
  old?: boolean;
};
const MoneyVND: React.FC<MoneyVNDProps> = ({
  value,
  className = "",
  color = "text-black",
  old = false,
}) => (
  <span
    className={`inline-flex items-baseline ${color} ${
      old ? "line-through text-gray-400" : "font-bold"
    } ${className}`}
  >
    <span>{formatVND(value)}</span>
    <span
      style={{
        position: "relative",
        top: "2px",
        marginLeft: "2px",
        fontSize: "1.1em",
      }}
    >
      ₫
    </span>
  </span>
);
export default MoneyVND;
