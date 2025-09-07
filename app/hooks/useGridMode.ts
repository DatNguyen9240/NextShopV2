import { useState, useEffect } from "react";
import { useBreakpoint } from "@/app/hooks/useBreakpoint";

export function useGridMode() {
  const breakpoint = useBreakpoint();

  const modes =
    breakpoint === "base" || breakpoint === "sm"
      ? [{ key: 2, label: "Grid 2" }]
      : [
          { key: 4, label: "Grid 4" },
          { key: 3, label: "Grid 3" },
        ];

  const [cols, setCols] = useState(modes[0].key);

  useEffect(() => {
    setCols(modes[0].key);
  }, [breakpoint]);

  return { cols, setCols, modes };
}
