import type { OrbitalPoints, ValenceOrbital } from './types';

// Cache for loaded orbital data
const pointCache = new Map<string, OrbitalPoints>();
const loadingPromises = new Map<string, Promise<OrbitalPoints>>();

/**
 * Get the orbital name key for a given orbital
 */
function getOrbitalKey(orbital: ValenceOrbital): string {
  const orbitalTypes = ['s', 'p', 'd', 'f'];
  return `${orbital.n}${orbitalTypes[orbital.l]}`;
}

/**
 * Load pre-computed orbital points from JSON file
 */
async function loadOrbitalPoints(orbital: ValenceOrbital): Promise<OrbitalPoints> {
  const key = getOrbitalKey(orbital);

  // Check cache first
  if (pointCache.has(key)) {
    return pointCache.get(key)!;
  }

  // Check if already loading
  if (loadingPromises.has(key)) {
    return loadingPromises.get(key)!;
  }

  // Start loading
  const loadPromise = (async () => {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}orbitals/${key}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load orbital ${key}`);
      }

      const data = await response.json();

      const points: OrbitalPoints = {
        positions: new Float32Array(data.positions),
        signs: new Int8Array(data.signs),
        count: data.signs.length,
        maxExtent: 1.5, // Already normalized
      };

      pointCache.set(key, points);
      loadingPromises.delete(key);

      return points;
    } catch (error) {
      loadingPromises.delete(key);
      console.error(`Failed to load orbital ${key}:`, error);
      // Return empty points on error
      return {
        positions: new Float32Array(0),
        signs: new Int8Array(0),
        count: 0,
        maxExtent: 0,
      };
    }
  })();

  loadingPromises.set(key, loadPromise);
  return loadPromise;
}

/**
 * Get orbital points - async version that loads from pre-computed files
 */
export async function getOrbitalPoints(orbital: ValenceOrbital): Promise<OrbitalPoints> {
  return loadOrbitalPoints(orbital);
}
