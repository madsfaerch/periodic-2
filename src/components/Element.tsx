import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const categoryColor = category?.color ?? 'hsl(var(--muted))';
  const isInHoveredGroup = !hoveredGroup || element.group === hoveredGroup;
  const isInHoveredPeriod = !hoveredPeriod || element.period === hoveredPeriod;

  // Active property coloring
  const propertyBg = activeProperty
    ? getElementPropertyColor(element, activeProperty)
    : null;
  const config = activeProperty ? propertyMap.get(activeProperty) : null;
  const hasNoValue =
    activeProperty != null && config?.kind === 'numeric' && propertyBg == null;

  const isRadiusMode = !!(activeProperty && RADIUS_KEYS.has(activeProperty));

  // Radius circle size
  const radiusSizePct = useMemo(() => {
    if (!isRadiusMode || config?.kind !== 'numeric') return 0;
    const numConfig = config as NumericPropertyConfig;
    const value = numConfig.getValue(element);
    const t = normalize(value, numConfig);
    return t != null ? 15 + t * 65 : 0;
  }, [isRadiusMode, config, element]);

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

  // Background: in radius mode, animate from category color to transparent
  const bgColor = isRadiusMode
    ? 'transparent'
    : propertyBg ?? categoryColor;

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
      <motion.button
        type="button"
        className={cn(
          'relative flex flex-col items-start justify-center w-full h-full cursor-pointer overflow-hidden',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          {
            'ring-2 ring-ring': isSelected,
            'ring-1 ring-ring/50': isHovered && !isSelected,
            'opacity-20': isDimmed,
          },
        )}
        animate={{
          backgroundColor: bgColor,
          borderRadius: isRadiusMode ? '50%' : '2px',
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        onClick={() => selectElement(element)}
        onMouseEnter={() => setHoveredElement(element)}
        onMouseLeave={() => setHoveredElement(null)}
        onFocus={() => setHoveredElement(element)}
        onBlur={() => setHoveredElement(null)}
        aria-pressed={isSelected}
        aria-label={`${element.name}, symbol ${element.symbol}, atomic number ${element.number}, ${element.category}`}
        data-element={element.number}
      >
        {/* Category-colored circle that morphs from full square to radius-sized circle */}
        <motion.div
          className="absolute rounded-full"
          style={{
            backgroundColor: categoryColor,
            left: '50%',
            top: '50%',
            x: '-50%',
            y: '-50%',
          }}
          animate={{
            width: isRadiusMode ? `${radiusSizePct}%` : '142%', // 142% to cover corners of square
            height: isRadiusMode ? `${radiusSizePct}%` : '142%',
            opacity: isRadiusMode ? 0.7 : 1,
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {/* Content layer */}
        <div className="relative z-10 w-full h-full">
          <AnimatePresence mode="wait">
            {isRadiusMode ? (
              <motion.div
                key="radius"
                className="flex items-center justify-center w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-[max(0.5rem,20cqw)] font-semibold text-neutral-900">
                  {element.symbol}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                className="p-[8cqw] flex flex-col items-start w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-[max(0.4rem,12cqw)] text-neutral-700 leading-tight">
                  {element.number}
                </span>
                <span className="text-[max(0.5rem,24cqw)] font-semibold leading-tight text-neutral-900">
                  {element.symbol}
                </span>
                <span className="text-[max(0.35rem,10cqw)] text-neutral-700 truncate max-w-full px-0.5 leading-tight">
                  {element.name}
                </span>
                <span className="text-[max(0.35rem,10cqw)] text-neutral-900 leading-tight mt-auto">
                  {element.atomic_mass.toFixed(2)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>
    </div>
  );
}
