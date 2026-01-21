/**
 * Hydrogen-like orbital wave functions for visualization.
 *
 * These are simplified wave functions that produce the correct orbital shapes.
 * We use atomic units where the Bohr radius a₀ = 1.
 */

/**
 * Associated Laguerre polynomial L_n^k(x)
 * Using recurrence relation for numerical stability
 */
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

/**
 * Factorial function with memoization
 */
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

/**
 * Radial wave function R_nl(r)
 * For hydrogen-like atoms with effective nuclear charge Z_eff
 */
function radialWaveFunction(
  n: number,
  l: number,
  r: number,
  zEff: number,
): number {
  const rho = (2 * zEff * r) / n;

  // Normalization constant
  const norm = Math.sqrt(
    ((2 * zEff) / n) ** 3 *
      (factorial(n - l - 1) / (2 * n * factorial(n + l))),
  );

  // Radial function
  const expPart = Math.exp(-rho / 2);
  const rhoPart = rho ** l;
  const laguerre = laguerreL(n - l - 1, 2 * l + 1, rho);

  return norm * expPart * rhoPart * laguerre;
}

/**
 * Real spherical harmonics Y_lm for visualization
 * These are the real combinations that give the familiar orbital shapes
 */
function sphericalHarmonic(
  l: number,
  m: number,
  theta: number,
  phi: number,
): number {
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);

  // s orbital (l=0)
  if (l === 0) {
    return 0.5 * Math.sqrt(1 / Math.PI);
  }

  // p orbitals (l=1)
  if (l === 1) {
    const norm = 0.5 * Math.sqrt(3 / Math.PI);
    if (m === 0) {
      // pz
      return norm * cosTheta;
    }
    if (m === 1) {
      // px
      return norm * sinTheta * Math.cos(phi);
    }
    if (m === -1) {
      // py
      return norm * sinTheta * Math.sin(phi);
    }
  }

  // d orbitals (l=2)
  if (l === 2) {
    const cos2Theta = cosTheta * cosTheta;
    const sin2Theta = sinTheta * sinTheta;

    if (m === 0) {
      // dz²
      const norm = 0.25 * Math.sqrt(5 / Math.PI);
      return norm * (3 * cos2Theta - 1);
    }
    if (m === 1) {
      // dxz
      const norm = 0.5 * Math.sqrt(15 / Math.PI);
      return norm * sinTheta * cosTheta * Math.cos(phi);
    }
    if (m === -1) {
      // dyz
      const norm = 0.5 * Math.sqrt(15 / Math.PI);
      return norm * sinTheta * cosTheta * Math.sin(phi);
    }
    if (m === 2) {
      // dx²-y²
      const norm = 0.25 * Math.sqrt(15 / Math.PI);
      return norm * sin2Theta * Math.cos(2 * phi);
    }
    if (m === -2) {
      // dxy
      const norm = 0.25 * Math.sqrt(15 / Math.PI);
      return norm * sin2Theta * Math.sin(2 * phi);
    }
  }

  // f orbitals (l=3) - simplified
  if (l === 3) {
    if (m === 0) {
      // fz³
      const norm = 0.25 * Math.sqrt(7 / Math.PI);
      return norm * (5 * cosTheta ** 3 - 3 * cosTheta);
    }
    // For other f orbitals, use a simplified form
    const norm = 0.25 * Math.sqrt(7 / Math.PI);
    return norm * sinTheta ** Math.abs(m) * cosTheta * Math.cos(m * phi);
  }

  return 0;
}

/**
 * Calculate wave function ψ at a given point (returns signed value)
 */
export function waveFunction(
  n: number,
  l: number,
  m: number,
  x: number,
  y: number,
  z: number,
  zEff: number = 1,
): number {
  const r = Math.sqrt(x * x + y * y + z * z);

  // Avoid division by zero at origin
  if (r < 1e-10) {
    // At origin, only s orbitals have non-zero value
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

/**
 * Calculate probability density |ψ|² at a given point
 */
export function probabilityDensity(
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

/**
 * Get the approximate maximum radius for an orbital
 * This helps bound the sampling region
 */
export function getMaxRadius(n: number, _l: number): number {
  // Approximate extent where probability becomes negligible
  // Based on the radial probability distribution r²|R|²
  // The peak is around n² for hydrogen-like atoms
  return n * n * 3 + 5;
}

/**
 * Get approximate maximum probability density for normalization
 * Pre-computed for common orbitals to speed up rejection sampling
 */
export function getMaxProbability(n: number, l: number, m: number): number {
  // These are approximate values for rejection sampling
  // The actual max depends on Z_eff but these work well for visualization
  const maxProb: Record<string, number> = {
    '1-0-0': 0.32, // 1s
    '2-0-0': 0.05, // 2s
    '2-1-0': 0.02, // 2p
    '2-1-1': 0.02,
    '2-1--1': 0.02,
    '3-0-0': 0.015, // 3s
    '3-1-0': 0.008, // 3p
    '3-2-0': 0.004, // 3d
    '3-2-1': 0.003,
    '3-2-2': 0.003,
    '4-0-0': 0.006, // 4s
    '4-1-0': 0.003, // 4p
    '4-2-0': 0.002, // 4d
    '4-3-0': 0.001, // 4f
  };

  const key = `${n}-${l}-${m}`;
  return maxProb[key] ?? 0.01 / (n * n);
}
