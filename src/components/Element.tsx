import type { Element as ElementType } from "@/data";
import { cn } from "@/lib/utils";
import { usePeriodicTableStore } from "@/store";

interface ElementProps {
  element: ElementType;
  className?: string;
}

export function Element({ element, className }: ElementProps) {
  const { selectedElement, hoveredElement, selectElement, setHoveredElement } =
    usePeriodicTableStore();
  const isSelected = selectedElement?.number === element.number;
  const isHovered = hoveredElement?.number === element.number;

  return (
    <div
      className={cn(
        "@container flex flex-col items-center justify-center p-0.5 aspect-square",
        className,
      )}
      style={{
        gridColumn: element.xpos,
        gridRow: element.ypos,
      }}
    >
      <button
        type="button"
        className={cn(
          "flex flex-col items-start justify-center w-full h-full rounded-sm bg-muted hover:bg-accent transition-colors cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isSelected && "ring-2 ring-ring",
          isHovered && !isSelected && "ring-1 ring-ring/50",
        )}
        onClick={() => selectElement(isSelected ? null : element)}
        onMouseEnter={() => setHoveredElement(element)}
        onMouseLeave={() => setHoveredElement(null)}
        onFocus={() => setHoveredElement(element)}
        onBlur={() => setHoveredElement(null)}
        aria-pressed={isSelected}
        aria-label={`${element.name}, symbol ${element.symbol}, atomic number ${element.number}`}
        data-element={element.number}
      >
        <div className="p-[8cqw] flex flex-col items-start w-full h-full">
          <span className="text-[max(0.4rem,12cqw)] text-muted-foreground leading-tight">
            {element.number}
          </span>
          <span className="text-[max(0.5rem,24cqw)] font-semibold leading-tight">
            {element.symbol}
          </span>
          <span className="text-[max(0.35rem,10cqw)] text-muted-foreground truncate max-w-full px-0.5 leading-tight">
            {element.name}
          </span>
        </div>
      </button>
    </div>
  );
}
