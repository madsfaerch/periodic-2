/**
 * Pre-compute orbital point clouds for all orbital types.
 * Run with: npx tsx scripts/generate-orbitals.ts
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// Orbital types we need to generate (covers all elements)
const ORBITALS = [
  { n: 1, l: 0, m: 0, name: "1s" },
  { n: 2, l: 0, m: 0, name: "2s" },
  { n: 2, l: 1, m: 0, name: "2p" },
  { n: 3, l: 0, m: 0, name: "3s" },
  { n: 3, l: 1, m: 0, name: "3p" },
  { n: 3, l: 2, m: 0, name: "3d" },
  { n: 4, l: 0, m: 0, name: "4s" },
  { n: 4, l: 1, m: 0, name: "4p" },
  { n: 4, l: 2, m: 0, name: "4d" },
  { n: 4, l: 3, m: 0, name: "4f" },
  { n: 5, l: 0, m: 0, name: "5s" },
  { n: 5, l: 1, m: 0, name: "5p" },
  { n: 5, l: 2, m: 0, name: "5d" },
  { n: 5, l: 3, m: 0, name: "5f" },
  { n: 6, l: 0, m: 0, name: "6s" },
  { n: 6, l: 1, m: 0, name: "6p" },
  { n: 6, l: 2, m: 0, name: "6d" },
  { n: 7, l: 0, m: 0, name: "7s" },
  { n: 7, l: 1, m: 0, name: "7p" },
];

const POINT_COUNT = 30000;

// ============ Wave function math (copied from waveFunctions.ts) ============

function laguerreL(n: number, k: number, x: number): number {
  if (n === 0) return 1;
  if (n === 1) return 1 + k - x;

  let l0 = 1;
  let l1 = 1 + k - x;

  for (let i = 2; i <= n; i++) {
    const l2 = ((2 * i - 1 + k - x) * l1 - (i - 1 + k) * l0) / i;
    l0 = l1;
    l1 = l2;
  }

  return l1;
}

const factorialCache: number[] = [1, 1];
function factorial(n: number): number {
  if (n < 0) return 1;
  if (factorialCache[n] !== undefined) return factorialCache[n];

  let result = factorialCache[factorialCache.length - 1];
  for (let i = factorialCache.length; i <= n; i++) {
    result *= i;
    factorialCache[i] = result;
  }

  return result;
}

function radialWaveFunction(
  n: number,
  l: number,
  r: number,
  zEff: number,
): number {
  const rho = (2 * zEff * r) / n;

  const norm = Math.sqrt(
    ((2 * zEff) / n) ** 3 * (factorial(n - l - 1) / (2 * n * factorial(n + l))),
  );

  const expPart = Math.exp(-rho / 2);
  const rhoPart = rho ** l;
  const laguerre = laguerreL(n - l - 1, 2 * l + 1, rho);

  return norm * expPart * rhoPart * laguerre;
}

function sphericalHarmonic(
  l: number,
  m: number,
  theta: number,
  phi: number,
): number {
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);

  if (l === 0) {
    return 0.5 * Math.sqrt(1 / Math.PI);
  }

  if (l === 1) {
    const norm = 0.5 * Math.sqrt(3 / Math.PI);
    if (m === 0) return norm * cosTheta;
    if (m === 1) return norm * sinTheta * Math.cos(phi);
    if (m === -1) return norm * sinTheta * Math.sin(phi);
  }

  if (l === 2) {
    const cos2Theta = cosTheta * cosTheta;
    const sin2Theta = sinTheta * sinTheta;

    if (m === 0) {
      const norm = 0.25 * Math.sqrt(5 / Math.PI);
      return norm * (3 * cos2Theta - 1);
    }
    if (m === 1) {
      const norm = 0.5 * Math.sqrt(15 / Math.PI);
      return norm * sinTheta * cosTheta * Math.cos(phi);
    }
    if (m === -1) {
      const norm = 0.5 * Math.sqrt(15 / Math.PI);
      return norm * sinTheta * cosTheta * Math.sin(phi);
    }
    if (m === 2) {
      const norm = 0.25 * Math.sqrt(15 / Math.PI);
      return norm * sin2Theta * Math.cos(2 * phi);
    }
    if (m === -2) {
      const norm = 0.25 * Math.sqrt(15 / Math.PI);
      return norm * sin2Theta * Math.sin(2 * phi);
    }
  }

  if (l === 3) {
    if (m === 0) {
      const norm = 0.25 * Math.sqrt(7 / Math.PI);
      return norm * (5 * cosTheta ** 3 - 3 * cosTheta);
    }
    const norm = 0.25 * Math.sqrt(7 / Math.PI);
    return norm * sinTheta ** Math.abs(m) * cosTheta * Math.cos(m * phi);
  }

  return 0;
}

function waveFunction(
  n: number,
  l: number,
  m: number,
  x: number,
  y: number,
  z: number,
  zEff: number = 1,
): number {
  const r = Math.sqrt(x * x + y * y + z * z);

  if (r < 1e-10) {
    if (l === 0) {
      const R = radialWaveFunction(n, l, 0, zEff);
      const Y = 0.5 * Math.sqrt(1 / Math.PI);
      return R * Y;
    }
    return 0;
  }

  const theta = Math.acos(z / r);
  const phi = Math.atan2(y, x);

  const R = radialWaveFunction(n, l, r, zEff);
  const Y = sphericalHarmonic(l, m, theta, phi);

  return R * Y;
}

function probabilityDensity(
  n: number,
  l: number,
  m: number,
  x: number,
  y: number,
  z: number,
  zEff: number = 1,
): number {
  const psi = waveFunction(n, l, m, x, y, z, zEff);
  return psi * psi;
}

// ============ Point generation ============

interface OrbitalData {
  n: number;
  l: number;
  m: number;
  name: string;
  positions: number[];
  signs: number[];
}

function generateOrbitalPoints(
  n: number,
  l: number,
  m: number,
  pointCount: number,
): { positions: number[]; signs: number[] } {
  const positions: number[] = [];
  const signs: number[] = [];

  const zEff = Math.max(1, n * 0.3);

  // Maximum radius where probability is non-negligible
  // For higher n, the outermost peak is around n²/zEff
  const maxR = (n * n * 4) / zEff;

  // Find max probability density by grid search
  let maxProb = 0;
  const searchSteps = 100;
  for (let ri = 1; ri <= searchSteps; ri++) {
    const r = (ri / searchSteps) * maxR;
    // For angular search, check along axes and diagonals
    for (const [tx, ty, tz] of [
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
      [1, 1, 0],
      [1, 0, 1],
      [0, 1, 1],
      [1, 1, 1],
    ]) {
      const len = Math.sqrt(tx * tx + ty * ty + tz * tz);
      const x = (r * tx) / len;
      const y = (r * ty) / len;
      const z = (r * tz) / len;
      const prob = probabilityDensity(n, l, m, x, y, z, zEff);
      maxProb = Math.max(maxProb, prob);
    }
  }
  maxProb *= 1.2; // Small safety margin

  let generated = 0;
  let attempts = 0;
  const maxAttempts = pointCount * 10000;
  let maxExtent = 0;

  // Pure rejection sampling: uniform in spherical coordinates, accept based on |ψ|²
  while (generated < pointCount && attempts < maxAttempts) {
    attempts++;

    // Uniform sampling in spherical coordinates
    // r³ distribution to account for spherical volume element
    const u = Math.random();
    const r = maxR * Math.cbrt(u); // cbrt gives uniform density in 3D

    const theta = Math.acos(2 * Math.random() - 1); // Uniform on sphere
    const phi = Math.random() * 2 * Math.PI;

    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.sin(theta) * Math.sin(phi);
    const z = r * Math.cos(theta);

    const prob = probabilityDensity(n, l, m, x, y, z, zEff);
    const acceptanceProb = prob / maxProb;

    if (Math.random() < acceptanceProb) {
      positions.push(x, y, z);

      const psi = waveFunction(n, l, m, x, y, z, zEff);
      signs.push(psi >= 0 ? 1 : -1);

      maxExtent = Math.max(maxExtent, r);
      generated++;
    }
  }

  // Normalize positions
  const scale = maxExtent > 0 ? 1.5 / maxExtent : 1;
  for (let i = 0; i < positions.length; i++) {
    // Round to 4 decimal places to reduce file size
    positions[i] = Math.round(positions[i] * scale * 10000) / 10000;
  }

  console.log(`  Generated ${generated} points in ${attempts} attempts`);

  return { positions, signs };
}

// ============ Main ============

const OUTPUT_DIR = join(process.cwd(), "public", "orbitals");

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log(`Generating ${ORBITALS.length} orbital point clouds...`);
console.log(`Output directory: ${OUTPUT_DIR}`);
console.log();

for (const orbital of ORBITALS) {
  console.log(`Generating ${orbital.name}...`);

  const { positions, signs } = generateOrbitalPoints(
    orbital.n,
    orbital.l,
    orbital.m,
    POINT_COUNT,
  );

  const data: OrbitalData = {
    n: orbital.n,
    l: orbital.l,
    m: orbital.m,
    name: orbital.name,
    positions,
    signs,
  };

  const filePath = join(OUTPUT_DIR, `${orbital.name}.json`);
  writeFileSync(filePath, JSON.stringify(data));

  const fileSizeKB = (JSON.stringify(data).length / 1024).toFixed(1);
  console.log(`  Saved to ${orbital.name}.json (${fileSizeKB} KB)`);
  console.log();
}

console.log("Done!");
