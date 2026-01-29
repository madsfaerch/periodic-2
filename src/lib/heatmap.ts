import type { Element } from '@/data';
import { elements } from '@/data';

export interface PropertyConfig {
  key: string;
  label: string;
  scale: 'log' | 'linear';
  getValue: (el: Element) => number | null;
}

export const heatmapProperties: PropertyConfig[] = [
  {
    key: 'atomic_mass',
    label: 'Atomic Mass',
    scale: 'log',
    getValue: (el) => el.atomic_mass,
  },
  {
    key: 'density',
    label: 'Density',
    scale: 'log',
    getValue: (el) => el.density,
  },
  {
    key: 'melt',
    label: 'Melting Point',
    scale: 'log',
    getValue: (el) => el.melt,
  },
  {
    key: 'boil',
    label: 'Boiling Point',
    scale: 'log',
    getValue: (el) => el.boil,
  },
  {
    key: 'electronegativity_pauling',
    label: 'Electronegativity',
    scale: 'linear',
    getValue: (el) => el.electronegativity_pauling,
  },
  {
    key: 'electron_affinity',
    label: 'Electron Affinity',
    scale: 'linear',
    getValue: (el) => el.electron_affinity,
  },
  {
    key: 'ionization_energy',
    label: 'Ionization Energy',
    scale: 'linear',
    getValue: (el) => el.ionization_energies[0] ?? null,
  },
];

export const heatmapPropertyMap = new Map(
  heatmapProperties.map((p) => [p.key, p]),
);

interface PropertyRange {
  min: number;
  max: number;
  scale: 'log' | 'linear';
}

const rangeCache = new Map<string, PropertyRange>();

function getRange(config: PropertyConfig): PropertyRange {
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

/** Normalize a value to 0–1 given the property config */
export function normalize(
  value: number | null,
  config: PropertyConfig,
): number | null {
  if (value == null) return null;

  const { min, max, scale } = getRange(config);
  if (min === max) return 0.5;

  if (scale === 'log') {
    if (value <= 0) return 0;
    const logMin = Math.log(Math.max(min, 1e-10));
    const logMax = Math.log(max);
    if (logMin === logMax) return 0.5;
    return Math.max(0, Math.min(1, (Math.log(value) - logMin) / (logMax - logMin)));
  }

  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Map a normalized 0–1 value to a heatmap color.
 * Gradient: dark blue → cyan → yellow → red
 */
export function heatmapColor(t: number): string {
  // 4-stop gradient
  const stops = [
    { t: 0, r: 30, g: 50, b: 120 },    // dark blue
    { t: 0.33, r: 40, g: 180, b: 200 }, // cyan
    { t: 0.66, r: 240, g: 220, b: 60 }, // yellow
    { t: 1, r: 220, g: 50, b: 40 },     // red
  ];

  // Find segment
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

/** Get the heatmap color for an element, or null if no value */
export function getElementHeatmapColor(
  element: Element,
  propertyKey: string,
): string | null {
  const config = heatmapPropertyMap.get(propertyKey);
  if (!config) return null;

  const value = config.getValue(element);
  const t = normalize(value, config);
  if (t == null) return null;

  return heatmapColor(t);
}
