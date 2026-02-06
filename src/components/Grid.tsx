import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface GridProps {
  children: React.ReactNode;
  className?: string;
}

const groups = Array.from({ length: 18 }, (_, i) => i + 1);
const periods = Array.from({ length: 7 }, (_, i) => i + 1);

export function Grid({ children, className }: GridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  const dimByAttribute = useCallback(
    (attr: "data-group" | "data-period", value: number | null) => {
      const grid = gridRef.current;
      if (!grid) return;
      if (value == null) {
        grid.removeAttribute("data-dim");
        return;
      }
      // Set data-dim on container; CSS handles the rest
      grid.setAttribute("data-dim", `${attr}:${value}`);
    },
    [],
  );

  return (
    <div className="flex-1 grid grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
      {/* Empty corner */}
      <div className="w-6" />
      {/* Group numbers row */}
      <div
        className="grid grid-cols-18"
        onMouseLeave={() => dimByAttribute("data-group", null)}
      >
        {groups.map((group) => (
          <span
            key={`group-${group}`}
            className="flex items-center py-1 justify-center text-xs text-muted-foreground pb-1 cursor-default hover:text-foreground hover:bg-muted rounded transition-colors"
            onMouseEnter={() => dimByAttribute("data-group", group)}
          >
            {group}
          </span>
        ))}
      </div>
      {/* Period numbers column */}
      <div
        className="grid grid-rows-10"
        onMouseLeave={() => dimByAttribute("data-period", null)}
      >
        {periods.map((period) => (
          <div key={`period-${period}`} className="flex p-1">
            <span
              className="flex items-center justify-center px-2 text-xs text-muted-foreground text-center cursor-default hover:text-foreground hover:bg-muted rounded transition-colors"
              style={{ gridRow: period }}
              onMouseEnter={() => dimByAttribute("data-period", period)}
            >
              {period}
            </span>
          </div>
        ))}
      </div>
      {/* Element grid */}
      <div
        ref={gridRef}
        className={cn("element-grid grid grid-cols-18 grid-rows-10", className)}
      >
        {children}
      </div>
    </div>
  );
}
