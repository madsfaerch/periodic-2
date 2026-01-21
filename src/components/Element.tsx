import type { Element as ElementType } from "@/data";
import { cn } from "@/lib/utils";

interface ElementProps {
  element: ElementType;
  className?: string;
}

export function Element({ element, className }: ElementProps) {
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
      <div className="flex flex-col items-center justify-center w-full h-full rounded-sm bg-muted hover:bg-accent transition-colors cursor-pointer">
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
    </div>
  );
}
