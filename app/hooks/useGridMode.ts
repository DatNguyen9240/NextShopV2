import { useState, useEffect, useMemo } from "react";
import { useBreakpoint } from "@/app/hooks/useBreakpoint";

export function useGridMode() {
  const breakpoint = useBreakpoint();

  const modes = useMemo(() => (
    breakpoint === "base" || breakpoint === "sm"
      ? [{ key: 2, label: "Grid 2" }]
      : [
          { key: 4, label: "Grid 4" },
          { key: 3, label: "Grid 3" },
        ]
  ), [breakpoint]);

  const [cols, setCols] = useState(modes[0].key);

  useEffect(() => {
    setCols(modes[0].key);
  }, [modes]);

  return { cols, setCols, modes };
}
