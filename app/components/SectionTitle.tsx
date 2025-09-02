import React from "react";

type SectionTitleProps = {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
};

const sizeMap = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
  "2xl": "text-4xl",
};

const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  size = "md",
}) => (
  <h2 className={`${sizeMap[size]} font-bold mb-6 text-gray-800`}>
    {children}
  </h2>
);

export default SectionTitle;
