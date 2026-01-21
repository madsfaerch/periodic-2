import { useMemo } from 'react';
import * as THREE from 'three';
import { generateOrbitalPointsCached } from '@/lib/orbital';
import type { ValenceOrbital } from '@/lib/orbital';

interface OrbitalPointCloudProps {
  orbital: ValenceOrbital;
  pointCount?: number;
  positiveColor?: string;
  negativeColor?: string;
  size?: number;
}

// Create a circular texture for round points
function createCircleTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Draw a solid circle
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Singleton texture
let circleTexture: THREE.Texture | null = null;
function getCircleTexture(): THREE.Texture {
  if (!circleTexture) {
    circleTexture = createCircleTexture();
  }
  return circleTexture;
}

export function OrbitalPointCloud({
  orbital,
  pointCount = 3000,
  positiveColor = '#00ffff', // Cyan
  negativeColor = '#ff00ff', // Magenta
  size = 0.06,
}: OrbitalPointCloudProps) {
  const { positions, colors } = useMemo(() => {
    const points = generateOrbitalPointsCached(orbital, pointCount);

    const posColor = new THREE.Color(positiveColor);
    const negColor = new THREE.Color(negativeColor);

    const colorArray: number[] = [];

    for (let i = 0; i < points.count; i++) {
      const sign = points.signs[i];
      const color = sign >= 0 ? posColor : negColor;
      colorArray.push(color.r, color.g, color.b);
    }

    return {
      positions: points.positions,
      colors: new Float32Array(colorArray),
    };
  }, [orbital.n, orbital.l, orbital.m, pointCount, positiveColor, negativeColor]);

  const texture = getCircleTexture();

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.9}
        depthWrite={true}
        map={texture}
        alphaTest={0.5}
      />
    </points>
  );
}
