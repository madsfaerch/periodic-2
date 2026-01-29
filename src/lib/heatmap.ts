import type { Element } from '@/data';
import { elements } from '@/data';
import { categoryMap, getCategoryForElement } from '@/data/categories';

// --- Numeric properties (heatmap coloring) ---

export interface NumericPropertyConfig {
  key: string;
  label: string;
  kind: 'numeric';
  scale: 'log' | 'linear';
  getValue: (el: Element) => number | null;
}

// --- Group properties (categorical highlighting) ---

export interface GroupPropertyConfig {
  key: string;
  label: string;
  kind: 'group';
  getGroup: (el: Element) => string;
}

export type PropertyConfig = NumericPropertyConfig | GroupPropertyConfig;

export const numericProperties: NumericPropertyConfig[] = [
  {
    key: 'atomic_mass',
    label: 'Atomic Mass',
    kind: 'numeric',
    scale: 'log',
    getValue: (el) => el.atomic_mass,
  },
  {
    key: 'density',
    label: 'Density',
    kind: 'numeric',
    scale: 'log',
    getValue: (el) => el.density,
  },
  {
    key: 'melt',
    label: 'Melting Point',
    kind: 'numeric',
    scale: 'log',
    getValue: (el) => el.melt,
  },
  {
    key: 'boil',
    label: 'Boiling Point',
    kind: 'numeric',
    scale: 'log',
    getValue: (el) => el.boil,
  },
  {
    key: 'electronegativity_pauling',
    label: 'Electronegativity',
    kind: 'numeric',
    scale: 'linear',
    getValue: (el) => el.electronegativity_pauling,
  },
  {
    key: 'electron_affinity',
    label: 'Electron Affinity',
    kind: 'numeric',
    scale: 'linear',
    getValue: (el) => el.electron_affinity,
  },
  {
    key: 'ionization_energy',
    label: 'Ionization Energy',
    kind: 'numeric',
    scale: 'linear',
    getValue: (el) => el.ionization_energies[0] ?? null,
  },
  {
    key: 'atomic_radius',
    label: 'Atomic Radius',
    kind: 'numeric',
    scale: 'linear',
    getValue: (el) => el.atomic_radius,
  },
  {
    key: 'covalent_radius',
    label: 'Covalent Radius',
    kind: 'numeric',
    scale: 'linear',
    getValue: (el) => el.covalent_radius,
  },
  {
    key: 'van_der_waals_radius',
    label: 'Van der Waals Radius',
    kind: 'numeric',
    scale: 'linear',
    getValue: (el) => el.van_der_waals_radius,
  },
];

export const groupProperties: GroupPropertyConfig[] = [
  {
    key: 'category',
    label: 'Category',
    kind: 'group',
    getGroup: (el) => el.category,
  },
  {
    key: 'phase',
    label: 'Phase',
    kind: 'group',
    getGroup: (el) => el.phase,
  },
  {
    key: 'block',
    label: 'Block',
    kind: 'group',
    getGroup: (el) => el.block.toUpperCase(),
  },
  {
    key: 'group',
    label: 'Group',
    kind: 'group',
    getGroup: (el) => String(el.group),
  },
  {
    key: 'period',
    label: 'Period',
    kind: 'group',
    getGroup: (el) => String(el.period),
  },
];

export const allProperties: PropertyConfig[] = [
  ...numericProperties,
  ...groupProperties,
];

export const propertyMap = new Map(allProperties.map((p) => [p.key, p]));

// Legacy alias
export const heatmapPropertyMap = propertyMap;

// --- Group colors ---

const GROUP_PALETTE = [
  '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80',
  '#2dd4bf', '#22d3ee', '#60a5fa', '#a78bfa', '#e879f9',
  '#f472b6', '#f97316', '#84cc16', '#14b8a6', '#8b5cf6',
  '#ec4899', '#ef4444', '#eab308',
];

const groupColorCache = new Map<string, Map<string, string>>();

/** Get a stable color for a group value within a property */
export function getGroupColor(propertyKey: string, groupValue: string): string {
  // For category property, use the canonical category colors
  if (propertyKey === 'category') {
    const cat = categoryMap.get(groupValue);
    if (cat) return cat.color;
    // Fall back to fuzzy match for "unknown, predicted to be..." variants
    const matched = getCategoryForElement(groupValue);
    if (matched) return matched.color;
  }

  let colorMap = groupColorCache.get(propertyKey);
  if (!colorMap) {
    const config = propertyMap.get(propertyKey);
    if (!config || config.kind !== 'group') return '#888';

    // Collect unique groups in element order for stable assignment
    const seen = new Set<string>();
    const groups: string[] = [];
    for (const el of elements) {
      const g = config.getGroup(el);
      if (!seen.has(g)) {
        seen.add(g);
        groups.push(g);
      }
    }

    colorMap = new Map();
    for (let i = 0; i < groups.length; i++) {
      colorMap.set(groups[i], GROUP_PALETTE[i % GROUP_PALETTE.length]);
    }
    groupColorCache.set(propertyKey, colorMap);
  }

  return colorMap.get(groupValue) ?? '#888';
}

// --- Numeric heatmap logic ---

interface PropertyRange {
  min: number;
  max: number;
  scale: 'log' | 'linear';
}

const rangeCache = new Map<string, PropertyRange>();

function getRange(config: NumericPropertyConfig): PropertyRange {
  const cached = rangeCache.get(config.key);
  if (cached) return cached;

  let min = Infinity;
  let max = -Infinity;

  for (const el of elements) {
    const val = config.getValue(el);
    if (val == null) continue;
    const v = config.scale === 'log' ? (val > 0 ? val : 0) : val;
    if (v < min) min = v;
    if (v > max) max = v;
  }

  const range: PropertyRange = { min, max, scale: config.scale };
  rangeCache.set(config.key, range);
  return range;
}

/** Normalize a value to 0–1 given a numeric property config */
export function normalize(
  value: number | null,
  config: NumericPropertyConfig,
): number | null {
  if (value == null) return null;

  const { min, max, scale } = getRange(config);
  if (min === max) return 0.5;

  if (scale === 'log') {
    if (value <= 0) return 0;
    const logMin = Math.log(Math.max(min, 1e-10));
    const logMax = Math.log(max);
    if (logMin === logMax) return 0.5;
    return Math.max(
      0,
      Math.min(1, (Math.log(value) - logMin) / (logMax - logMin)),
    );
  }

  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Map a normalized 0–1 value to a heatmap color.
 * Gradient: dark blue → cyan → yellow → red
 */
export function heatmapColor(t: number): string {
  const stops = [
    { t: 0, r: 30, g: 50, b: 120 },
    { t: 0.33, r: 40, g: 180, b: 200 },
    { t: 0.66, r: 240, g: 220, b: 60 },
    { t: 1, r: 220, g: 50, b: 40 },
  ];

  let i = 0;
  while (i < stops.length - 2 && t > stops[i + 1].t) i++;

  const a = stops[i];
  const b = stops[i + 1];
  const f = (t - a.t) / (b.t - a.t);

  const r = Math.round(a.r + (b.r - a.r) * f);
  const g = Math.round(a.g + (b.g - a.g) * f);
  const bl = Math.round(a.b + (b.b - a.b) * f);

  return `rgb(${r}, ${g}, ${bl})`;
}

/** Get the display color for an element given an active property */
export function getElementPropertyColor(
  element: Element,
  propertyKey: string,
): string | null {
  const config = propertyMap.get(propertyKey);
  if (!config) return null;

  if (config.kind === 'group') {
    return getGroupColor(propertyKey, config.getGroup(element));
  }

  const value = config.getValue(element);
  const t = normalize(value, config);
  if (t == null) return null;
  return heatmapColor(t);
}

// Legacy alias
export const getElementHeatmapColor = getElementPropertyColor;
