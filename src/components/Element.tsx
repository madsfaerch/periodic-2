import type { Element as ElementType } from '@/data';
import { getCategoryForElement } from '@/data/categories';
import { cn } from '@/lib/utils';
import { usePeriodicTableStore } from '@/store';

interface ElementProps {
  element: ElementType;
  className?: string;
}

export function Element({ element, className }: ElementProps) {
  const {
    selectedElement,
    hoveredElement,
    highlightedCategory,
    hoveredCategory,
    selectElement,
    setHoveredElement,
  } = usePeriodicTableStore();
  const isSelected = selectedElement?.number === element.number;
  const isHovered = hoveredElement?.number === element.number;

  const category = getCategoryForElement(element.category);
  const activeCategory = highlightedCategory ?? hoveredCategory;
  const isInActiveCategory =
    !activeCategory || element.category.includes(activeCategory);
  const isDimmed = activeCategory && !isInActiveCategory;

  return (
    <div
      className={cn(
        '@container flex flex-col items-center justify-center p-0.5 aspect-square',
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
          'flex flex-col items-start justify-center w-full h-full rounded-sm transition-all cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          {
            'ring-2 ring-ring': isSelected,
            'ring-1 ring-ring/50': isHovered && !isSelected,
            'opacity-20': isDimmed,
          },
        )}
        style={{
          backgroundColor: category?.color ?? 'hsl(var(--muted))',
        }}
        onClick={() => selectElement(isSelected ? null : element)}
        onMouseEnter={() => setHoveredElement(element)}
        onMouseLeave={() => setHoveredElement(null)}
        onFocus={() => setHoveredElement(element)}
        onBlur={() => setHoveredElement(null)}
        aria-pressed={isSelected}
        aria-label={`${element.name}, symbol ${element.symbol}, atomic number ${element.number}, ${element.category}`}
        data-element={element.number}
      >
        <div className="p-[8cqw] flex flex-col items-start w-full h-full">
          <span className="text-[max(0.4rem,12cqw)] text-neutral-700 leading-tight">
            {element.number}
          </span>
          <span className="text-[max(0.5rem,24cqw)] font-semibold leading-tight text-neutral-900">
            {element.symbol}
          </span>
          <span className="text-[max(0.35rem,10cqw)] text-neutral-700 truncate max-w-full px-0.5 leading-tight">
            {element.name}
          </span>
        </div>
      </button>
    </div>
  );
}
