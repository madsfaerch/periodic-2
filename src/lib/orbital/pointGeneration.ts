import type { OrbitalPoints, ValenceOrbital } from './types';
import {
  getMaxProbability,
  getMaxRadius,
  probabilityDensity,
  waveFunction,
} from './waveFunctions';

/**
 * Generate points distributed according to orbital probability density |ψ|²
 * using rejection sampling (Monte Carlo method).
 * Points are normalized to fit within a unit sphere for consistent viewing.
 */
export function generateOrbitalPoints(
  orbital: ValenceOrbital,
  pointCount: number,
): OrbitalPoints {
  const { n, l, m } = orbital;
  const positions: number[] = [];
  const signs: number[] = [];

  // Get bounding box and normalization
  const maxR = getMaxRadius(n, l);
  const maxProb = getMaxProbability(n, l, m);

  // Effective nuclear charge - simplified approximation
  // Higher n orbitals are more shielded
  const zEff = Math.max(1, n * 0.3);

  let generated = 0;
  let attempts = 0;
  const maxAttempts = pointCount * 1000; // Prevent infinite loops
  let maxExtent = 0;

  while (generated < pointCount && attempts < maxAttempts) {
    attempts++;

    // Generate random point in bounding sphere
    // Use spherical coordinates for better sampling efficiency
    const r = Math.random() * maxR;
    const theta = Math.acos(2 * Math.random() - 1); // Uniform on sphere
    const phi = Math.random() * 2 * Math.PI;

    // Convert to Cartesian
    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.sin(theta) * Math.sin(phi);
    const z = r * Math.cos(theta);

    // Calculate probability at this point
    const prob = probabilityDensity(n, l, m, x, y, z, zEff);

    // Rejection sampling: accept with probability proportional to density
    // Multiply by r² to account for spherical volume element
    const acceptanceProb = (prob * r * r) / (maxProb * maxR * maxR);

    if (Math.random() < acceptanceProb * 10) {
      // Scale factor for better acceptance rate
      positions.push(x, y, z);

      // Get the sign of the wave function at this point
      const psi = waveFunction(n, l, m, x, y, z, zEff);
      signs.push(psi >= 0 ? 1 : -1);

      // Track the maximum extent for normalization
      maxExtent = Math.max(maxExtent, r);
      generated++;
    }
  }

  // If we didn't generate enough points, fill with origin points
  while (positions.length < pointCount * 3) {
    positions.push(0, 0, 0);
    signs.push(1);
  }

  // Normalize positions to fit within a consistent view size
  // Scale so maxExtent maps to ~1.5 units
  const scale = maxExtent > 0 ? 1.5 / maxExtent : 1;
  for (let i = 0; i < positions.length; i++) {
    positions[i] *= scale;
  }

  return {
    positions: new Float32Array(positions),
    signs: new Int8Array(signs),
    count: generated,
    maxExtent,
  };
}

// Cache for generated orbital points
const pointCache = new Map<string, OrbitalPoints>();

/**
 * Generate orbital points with caching
 * Since there are only ~20 unique orbital types, we can cache them
 */
export function generateOrbitalPointsCached(
  orbital: ValenceOrbital,
  pointCount: number,
): OrbitalPoints {
  const cacheKey = `${orbital.n}-${orbital.l}-${orbital.m}-${pointCount}`;

  if (pointCache.has(cacheKey)) {
    return pointCache.get(cacheKey)!;
  }

  const points = generateOrbitalPoints(orbital, pointCount);
  pointCache.set(cacheKey, points);

  return points;
}
