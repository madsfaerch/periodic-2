import type { ValenceOrbital } from './types';

const orbitalTypeToL: Record<string, number> = {
  s: 0,
  p: 1,
  d: 2,
  f: 3,
};

/**
 * Parse electron configuration string to extract the valence (outermost) orbital.
 * Examples:
 *   "1s1" → { n: 1, l: 0, orbitalType: 's', electrons: 1 }
 *   "[He] 2s2 2p2" → { n: 2, l: 1, orbitalType: 'p', electrons: 2 }
 *   "[Ar] 3d6 4s2" → { n: 3, l: 2, orbitalType: 'd', electrons: 6 }
 */
export function parseValenceOrbital(config: string): ValenceOrbital {
  // Remove noble gas core notation like [He], [Ne], [Ar], etc.
  const withoutCore = config.replace(/\[[A-Za-z]+\]\s*/g, '');

  // Split into individual orbitals
  const orbitals = withoutCore.trim().split(/\s+/);

  if (orbitals.length === 0 || !orbitals[0]) {
    // Fallback for edge cases
    return { n: 1, l: 0, m: 0, orbitalType: 's', electrons: 1 };
  }

  // Get the last orbital (valence)
  // But for d-block elements, the d orbital is often listed before s
  // We want the highest energy orbital which is typically:
  // - The d or f orbital for transition metals/lanthanides/actinides
  // - The last listed orbital otherwise

  // Find the highest n orbital, preferring d/f over s/p at same n
  let valenceOrbital = orbitals[orbitals.length - 1];

  // For d-block: if we have both nd and (n+1)s, prefer the d orbital
  // For f-block: if we have nf, prefer that
  for (const orbital of orbitals) {
    if (orbital.includes('d') || orbital.includes('f')) {
      valenceOrbital = orbital;
      break;
    }
  }

  // Parse the orbital string (e.g., "3p5" or "4d10")
  const match = valenceOrbital.match(/(\d+)([spdf])(\d+)/);

  if (!match) {
    return { n: 1, l: 0, m: 0, orbitalType: 's', electrons: 1 };
  }

  const n = Number.parseInt(match[1], 10);
  const orbitalType = match[2] as 's' | 'p' | 'd' | 'f';
  const electrons = Number.parseInt(match[3], 10);
  const l = orbitalTypeToL[orbitalType];

  // For visualization, we'll use m=0 for s orbitals,
  // and specific m values for p, d, f to show characteristic shapes
  // p: m=0 gives pz (dumbbell along z)
  // d: m=0 gives dz² shape
  const m = 0;

  return { n, l, m, orbitalType, electrons };
}

/**
 * Get a human-readable description of the orbital
 */
export function getOrbitalDescription(orbital: ValenceOrbital): string {
  const shapes: Record<string, string> = {
    s: 'spherical',
    p: 'dumbbell',
    d: 'cloverleaf',
    f: 'complex',
  };

  return `${orbital.n}${orbital.orbitalType} orbital (${shapes[orbital.orbitalType]} shape)`;
}
