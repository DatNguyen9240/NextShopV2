import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Heart,
  Shuffle,
  X,
} from "lucide-react";

type ButtonProps = {
  onClick?: () => void;
  size?: "sm" | "md" | "lg" | number;
  shape?: "circle" | "rounded" | "square" | "roundedSquare";
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  hidden?: boolean;
  disabled?: boolean;
};

const sizeMap: Record<string, string> = {
  sm: "w-5 h-5 text-[11px]",
  md: "w-10 h-10 text-sm",
  lg: "w-20 h-20 text-xl",
};

const paddingMap: Record<string, string> = {
  sm: "px-2 py-1 text-[11px]",
  md: "px-3.5 py-1.5 text-sm",
  lg: "px-8 py-3 text-lg",
};

const shapeMap: Record<string, string> = {
  circle: "rounded-full",
  rounded: "rounded-full",
  square: "rounded-none",
  roundedSquare: "rounded-lg",
};

const Button: React.FC<ButtonProps> = ({
  onClick,
  size = "md",
  shape = "circle",
  icon,
  className = "",
  children,
  hidden = false,
  disabled = false,
}) => {
  let sizeClass = "";
  if (shape === "circle" || shape === "square") {
    sizeClass =
      typeof size === "number"
        ? `w-[${size}px] h-[${size}px]`
        : sizeMap[size] || sizeMap["md"];
  } else {
    sizeClass =
      typeof size === "number"
        ? `px-[${size}px] py-[${Math.round(Number(size) / 3)}px]`
        : paddingMap[size] || paddingMap["md"];
  }
  const shapeClass = shapeMap[shape] || "";

  return (
    <button
      onClick={onClick}
      className={`${sizeClass} ${shapeClass} ${
        hidden ? "invisible" : ""
      } ${className}`}
      disabled={disabled}
    >
      {icon && children ? (
        <>
          <span className="mr-2 flex items-center justify-center">{icon}</span>
          {children}
        </>
      ) : icon ? (
        icon
      ) : (
        children
      )}
    </button>
  );
};

export const AddToCartButton: React.FC<{
  onClick?: () => void;
  className?: string;
}> = ({ onClick, className = "" }) => (
  <Button
    shape="rounded"
    size="md"
    className={`bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center ${className}`}
    icon={<span className="text-xl mr-2">🛒</span>}
    onClick={onClick}
  >
    Add To Cart
  </Button>
);

export const ButtonSize: React.FC<{
  value: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ value, selected = false, onClick, className = "" }) => (
  <Button
    shape="square"
    size="md"
    onClick={onClick}
    className={`border mx-2 bg-white text-black shadow-none hover:bg-gray-100 ${
      selected ? "border-pink-600 bg-pink-50 text-pink-600" : "border-gray-300"
    } ${className}`}
  >
    {value}
  </Button>
);

export const WishlistButton: React.FC<{
  onClick?: () => void;
  className?: string;
}> = ({ onClick, className = "" }) => (
  <Button
    shape="rounded"
    size="sm"
    className={`border border-gray-300 bg-white text-black flex items-center gap-0.5 hover:bg-gray-100 transition-colors duration-200 ${className}`}
    icon={<Heart className="w-3.5 h-3.5" strokeWidth={1} />}
    onClick={onClick}
  >
    ADD TO WISHLIST
  </Button>
);

export const CompareButton: React.FC<{
  onClick?: () => void;
  className?: string;
}> = ({ onClick, className = "" }) => (
  <Button
    shape="rounded"
    size="sm"
    className={`border border-gray-300 bg-white text-black flex items-center gap-0.5 hover:bg-gray-100 transition-colors duration-200 ${className}`}
    icon={<Shuffle className="w-3.5 h-3.5" strokeWidth={1} />}
    onClick={onClick}
  >
    COMPARE
  </Button>
);

export const ButtonMinus: React.FC<{
  onClick?: () => void;
  className?: string;
}> = ({ onClick, className = "" }) => (
  <Button
    shape="circle"
    size="md"
    className={`border border-gray-300 bg-white text-black flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 ${className}`}
    icon={<Minus className="w-4 h-4" strokeWidth={2} />}
    onClick={onClick}
  />
);

export const ButtonPlus: React.FC<{
  onClick?: () => void;
  className?: string;
}> = ({ onClick, className = "" }) => (
  <Button
    shape="circle"
    size="md"
    className={`border border-gray-300 bg-white text-black flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 ${className}`}
    icon={<Plus className="w-4 h-4" strokeWidth={2} />}
    onClick={onClick}
  />
);

export const ButtonPrev: React.FC<ButtonProps> = (props) => (
  <Button
    shape="circle"
    size="md"
    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 bg-gray-200 border rounded-full flex items-center justify-center hover:bg-gray-200 ${
      props.className ?? ""
    }`}
    icon={<ChevronLeft className="w-4 h-4" strokeWidth={2} />}
    {...props}
  />
);

export const ButtonNext: React.FC<ButtonProps> = (props) => (
  <Button
    shape="circle"
    size="md"
    className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 bg-gray-200 border rounded-full flex items-center justify-center hover:bg-gray-300 ${
      props.className ?? ""
    }`}
    icon={<ChevronRight className="w-4 h-4" strokeWidth={2} />}
    {...props}
  />
);

export const ButtonClose: React.FC<{
  onClick?: () => void;
  className?: string;
}> = ({ onClick, className = "" }) => (
  <Button
    shape="circle"
    size="md"
    className={`border border-gray-300 bg-white text-black flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 ${className}`}
    icon={<X className="w-4 h-4" strokeWidth={2} />}
    onClick={onClick}
  />
);

export const PaginationButton: React.FC<ButtonProps> = (props) => (
  <Button
    shape="roundedSquare"
    size="md"
    className={`transition-colors duration-200
      ${
        props.disabled
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-pink-600 text-white hover:bg-pink-700 cursor-pointer shadow-md"
      }
      ${props.className ?? ""}
    `}
    disabled={props.disabled}
    hidden={props.hidden}
    onClick={props.onClick}
  >
    {props.children}
  </Button>
);

export const SignUpButton = React.memo(function SignUpButton(props) {
  return (
    <Button
      shape="roundedSquare"
      size="md"
      className="bg-black text-white font-semibold ml-4 px-6 py-2 text-base hover:bg-gray-900 transition-colors whitespace-nowrap"
      {...props}
    >
      Đăng ký
    </Button>
  );
});

export default Button;
