export interface ValenceOrbital {
  n: number; // Principal quantum number (1, 2, 3, ...)
  l: number; // Angular momentum quantum number (0=s, 1=p, 2=d, 3=f)
  m: number; // Magnetic quantum number (-l to +l)
  orbitalType: 's' | 'p' | 'd' | 'f';
  electrons: number; // Number of electrons in this orbital
}

export interface OrbitalPoints {
  positions: Float32Array;
  signs: Int8Array; // +1 or -1 for wave function phase
  count: number;
  maxExtent: number; // Maximum distance from origin for auto-fitting
}
