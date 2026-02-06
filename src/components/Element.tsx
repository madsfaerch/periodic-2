import { useMemo } from 'react';
import { motion } from 'motion/react';
import type { Element as ElementType } from '@/data';
import { getCategoryForElement } from '@/data/categories';
import { getElementPropertyColor, propertyMap, normalize } from '@/lib/heatmap';
import type { NumericPropertyConfig } from '@/lib/heatmap';
import { cn } from '@/lib/utils';
import { usePeriodicTableStore } from '@/store';
import { RADIUS_KEYS } from '@/lib/constants';

interface ElementProps {
  element: ElementType;
  className?: string;
}

export function Element({ element, className }: ElementProps) {
  const isSelected = usePeriodicTableStore((s) => s.selectedElement?.number === element.number);
  const isHovered = usePeriodicTableStore((s) => s.hoveredElement?.number === element.number);
  const activeProperty = usePeriodicTableStore((s) => s.activeProperty);
  const selectElement = usePeriodicTableStore((s) => s.selectElement);
  const setHoveredElement = usePeriodicTableStore((s) => s.setHoveredElement);

  const category = getCategoryForElement(element.category);
  const categoryColor = category?.color ?? 'hsl(var(--muted))';

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
  const selectedElementForGroup = usePeriodicTableStore((s) => s.selectedElement);
  let isGroupDimmed = false;
  if (config?.kind === 'group' && selectedElementForGroup) {
    const selectedGroup = config.getGroup(selectedElementForGroup);
    const thisGroup = config.getGroup(element);
    isGroupDimmed = selectedGroup !== thisGroup;
  }

  const isDimmed = hasNoValue || isGroupDimmed;

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
      data-group={element.group}
      data-period={element.period}
      style={{
        gridColumn: element.xpos,
        gridRow: element.ypos,
      }}
    >
      <motion.button
        type="button"
        initial={false}
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
        transition={{ duration: 0.5, ease: 'linear' }}
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
          initial={false}
          style={{
            backgroundColor: categoryColor,
            left: '50%',
            top: '50%',
            x: '-50%',
            y: '-50%',
          }}
          animate={{
            width: isRadiusMode ? `${radiusSizePct}%` : '142%',
            height: isRadiusMode ? `${radiusSizePct}%` : '142%',
            opacity: isRadiusMode ? 0.7 : 1,
          }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />

        {/* Content layer — both layouts rendered, opacity crossfade */}
        <div className="relative z-10 w-full h-full">
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={false}
            animate={{ opacity: isRadiusMode ? 1 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <span className="text-[max(0.5rem,20cqw)] font-semibold text-neutral-900">
              {element.symbol}
            </span>
          </motion.div>
          <motion.div
            className="absolute inset-0 p-[8cqw] flex flex-col items-start"
            initial={false}
            animate={{ opacity: isRadiusMode ? 0 : 1 }}
            transition={{ duration: 0.25 }}
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
        </div>
      </motion.button>
    </div>
  );
}
