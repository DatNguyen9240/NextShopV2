import { useState, useEffect } from "react";

export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl";

export function useBreakpoint(): Breakpoint {
  const [width, setWidth] = useState(1280);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (width < 640) return "base";
  if (width < 768) return "sm";
  if (width < 1024) return "md";
  if (width < 1280) return "lg";
  return "xl";
}
