import type { Element as ElementType } from '@/data';
import { getCategoryForElement } from '@/data/categories';
import { getElementPropertyColor, propertyMap, normalize } from '@/lib/heatmap';
import type { NumericPropertyConfig } from '@/lib/heatmap';
import { cn } from '@/lib/utils';
import { usePeriodicTableStore } from '@/store';

const RADIUS_KEYS = new Set(['atomic_radius', 'covalent_radius', 'van_der_waals_radius']);

interface ElementProps {
  element: ElementType;
  className?: string;
}

export function Element({ element, className }: ElementProps) {
  const {
    selectedElement,
    hoveredElement,
    hoveredGroup,
    hoveredPeriod,
    activeProperty,
    selectElement,
    setHoveredElement,
  } = usePeriodicTableStore();
  const isSelected = selectedElement?.number === element.number;
  const isHovered = hoveredElement?.number === element.number;

  const category = getCategoryForElement(element.category);
  const isInHoveredGroup = !hoveredGroup || element.group === hoveredGroup;
  const isInHoveredPeriod = !hoveredPeriod || element.period === hoveredPeriod;

  // Active property coloring
  const propertyBg = activeProperty
    ? getElementPropertyColor(element, activeProperty)
    : null;
  const config = activeProperty ? propertyMap.get(activeProperty) : null;
  const hasNoValue =
    activeProperty != null && config?.kind === 'numeric' && propertyBg == null;

  // Highlight matching group value when a group property is active and an element is selected
  const selectedElement_ = usePeriodicTableStore((s) => s.selectedElement);
  let isGroupDimmed = false;
  if (config?.kind === 'group' && selectedElement_) {
    const selectedGroup = config.getGroup(selectedElement_);
    const thisGroup = config.getGroup(element);
    isGroupDimmed = selectedGroup !== thisGroup;
  }

  const isDimmed =
    hasNoValue ||
    isGroupDimmed ||
    (hoveredGroup && !isInHoveredGroup) ||
    (hoveredPeriod && !isInHoveredPeriod);

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
          backgroundColor: activeProperty && RADIUS_KEYS.has(activeProperty)
            ? 'hsl(var(--muted))'
            : propertyBg ?? category?.color ?? 'hsl(var(--muted))',
        }}
        onClick={() => selectElement(element)}
        onMouseEnter={() => setHoveredElement(element)}
        onMouseLeave={() => setHoveredElement(null)}
        onFocus={() => setHoveredElement(element)}
        onBlur={() => setHoveredElement(null)}
        aria-pressed={isSelected}
        aria-label={`${element.name}, symbol ${element.symbol}, atomic number ${element.number}, ${element.category}`}
        data-element={element.number}
      >
        {activeProperty && RADIUS_KEYS.has(activeProperty) && config?.kind === 'numeric' ? (() => {
          const numConfig = config as NumericPropertyConfig;
          const value = numConfig.getValue(element);
          const t = normalize(value, numConfig);
          const sizePct = t != null ? 15 + t * 65 : 0;
          return (
            <div className="relative w-full" style={{ paddingBottom: '100%' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                {t != null && (
                  <div
                    className="rounded-full absolute"
                    style={{
                      width: `${sizePct}%`,
                      aspectRatio: '1',
                      backgroundColor: category?.color ?? 'hsl(var(--muted))',
                      opacity: 0.7,
                    }}
                  />
                )}
                <span className="text-[max(0.5rem,20cqw)] font-semibold text-neutral-900 relative z-10">
                  {element.symbol}
                </span>
              </div>
            </div>
          );
        })() : (
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
          <span className="text-[max(0.3rem,8cqw)] text-neutral-500 leading-tight mt-auto">
            {element.atomic_mass.toFixed(2)}
          </span>
        </div>
        )}
      </button>
    </div>
  );
}
