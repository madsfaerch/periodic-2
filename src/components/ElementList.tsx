import { useMemo } from 'react';
import { elements } from '@/data';
import { getCategoryForElement, categoryMap } from '@/data/categories';
import { propertyMap, getGroupColor, normalize } from '@/lib/heatmap';
import type { GroupPropertyConfig, NumericPropertyConfig } from '@/lib/heatmap';
import { usePeriodicTableStore } from '@/store';
import { cn } from '@/lib/utils';
import { RADIUS_KEYS } from '@/lib/constants';
import { ArrowUpDown } from 'lucide-react';

export function ElementList() {
  const { selectedElement, selectElement, activeProperty, sortDirection, toggleSortDirection } =
    usePeriodicTableStore();

  const config = activeProperty ? propertyMap.get(activeProperty) : null;
  const isGroup = config?.kind === 'group';
  const isNumeric = config?.kind === 'numeric';

  const sortLabel = config?.label ?? 'Atomic Number';

  // For group properties: group and sort within groups
  const grouped = useMemo(() => {
    if (!isGroup || !config) return null;
    const groupConfig = config as GroupPropertyConfig;

    const groupMap = new Map<string, typeof elements>();
    for (const el of elements) {
      const g = groupConfig.getGroup(el);
      if (!groupMap.has(g)) groupMap.set(g, []);
      groupMap.get(g)!.push(el);
    }

    // Sort groups by first element's atomic number
    const entries = [...groupMap.entries()].sort((a, b) => {
      return sortDirection === 'asc'
        ? a[1][0].number - b[1][0].number
        : b[1][0].number - a[1][0].number;
    });

    // Sort elements within each group by atomic number
    for (const [, els] of entries) {
      els.sort((a, b) => a.number - b.number);
    }

    return entries;
  }, [config, isGroup, sortDirection]);

  // For numeric or default: flat sorted list
  const sortedElements = useMemo(() => {
    if (isGroup) return null;

    const sorted = [...elements];
    if (isNumeric && config) {
      const numConfig = config as NumericPropertyConfig;
      sorted.sort((a, b) => {
        const aVal = numConfig.getValue(a);
        const bVal = numConfig.getValue(b);
        if (aVal == null && bVal == null) return a.number - b.number;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });
    } else {
      sorted.sort((a, b) =>
        sortDirection === 'asc' ? a.number - b.number : b.number - a.number,
      );
    }

    return sorted;
  }, [config, isNumeric, isGroup, sortDirection]);

  return (
    <div className="space-y-2 overflow-y-auto">
      {/* Sort header */}
      <button
        type="button"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        onClick={toggleSortDirection}
      >
        <ArrowUpDown className="size-3" />
        <span>
          {isGroup ? 'Grouped' : 'Sort'} by{' '}
          <span className="font-medium text-foreground">{sortLabel}</span>
          {' '}({sortDirection === 'asc' ? '↑ ascending' : '↓ descending'})
        </span>
      </button>

      {isGroup && grouped ? (
        // Grouped layout
        <div className="space-y-3">
          {grouped.map(([groupValue, groupElements]) => (
            <div key={groupValue}>
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-t text-neutral-900 text-xs font-semibold uppercase tracking-wide"
                style={{ backgroundColor: activeProperty === 'category' ? (categoryMap.get(groupValue)?.color ?? getGroupColor(activeProperty!, groupValue)) : getGroupColor(activeProperty!, groupValue) }}
              >
                {groupValue}
                <span className="text-neutral-700 font-normal">({groupElements.length})</span>
              </div>
              <div className="border border-t-0 border-border rounded-b divide-y divide-border">
                {groupElements.map((element) => (
                  <ElementRow
                    key={element.number}
                    element={element}
                    isSelected={selectedElement?.number === element.number}
                    onSelect={selectElement}
                    rightValue={String(element.atomic_mass.toFixed(2))}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat sorted layout
        <div className="border border-border rounded divide-y divide-border">
          {sortedElements?.map((element) => {
            const numConfig = isNumeric ? (config as NumericPropertyConfig) : null;
            const propertyValue = numConfig ? numConfig.getValue(element) : null;

            const isRadius = activeProperty != null && RADIUS_KEYS.has(activeProperty);
            const radiusNorm = isRadius && numConfig ? normalize(propertyValue, numConfig) : undefined;

            return (
              <ElementRow
                key={element.number}
                element={element}
                isSelected={selectedElement?.number === element.number}
                onSelect={selectElement}
                rightValue={
                  numConfig
                    ? propertyValue != null
                      ? formatValue(propertyValue, activeProperty!)
                      : '—'
                    : element.atomic_mass.toFixed(2)
                }
                radiusNorm={radiusNorm}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ElementRow({
  element,
  isSelected,
  onSelect,
  rightValue,
  radiusNorm,
}: {
  element: (typeof elements)[number];
  isSelected: boolean;
  onSelect: (el: (typeof elements)[number]) => void;
  rightValue: string;
  radiusNorm?: number | null;
}) {
  const category = getCategoryForElement(element.category);
  const circleSize = radiusNorm != null ? Math.round(8 + radiusNorm * 16) : 0;

  return (
    <button
      type="button"
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
        isSelected
          ? 'bg-muted ring-1 ring-ring/30'
          : 'hover:bg-muted/50',
      )}
      onClick={() => onSelect(element)}
    >
      <span className="text-xs text-muted-foreground w-6 text-right">
        {element.number}
      </span>
      <span
        className="w-10 h-8 flex items-center justify-center rounded text-sm font-bold text-neutral-900"
        style={{
          backgroundColor: category?.color ?? 'hsl(var(--muted))',
        }}
      >
        {element.symbol}
      </span>
      <span className="flex-1 text-sm font-medium">{element.name}</span>
      {radiusNorm != null && circleSize > 0 && (
        <span
          className="rounded-full inline-block shrink-0"
          style={{
            width: circleSize,
            height: circleSize,
            backgroundColor: 'currentColor',
          }}
        />
      )}
      <span className="text-xs text-muted-foreground tabular-nums">
        {rightValue}
      </span>
    </button>
  );
}

function formatValue(value: number, propertyKey: string): string {
  switch (propertyKey) {
    case 'atomic_mass':
      return value.toFixed(4);
    case 'density':
      return `${value} g/cm³`;
    case 'melt':
    case 'boil':
      return `${value} K`;
    case 'electronegativity_pauling':
      return value.toFixed(2);
    case 'electron_affinity':
      return `${value.toFixed(1)} kJ/mol`;
    case 'ionization_energy':
      return `${value.toFixed(1)} kJ/mol`;
    case 'atomic_radius':
    case 'covalent_radius':
    case 'van_der_waals_radius':
      return `${value} pm`;
    default:
      return String(value);
  }
}
