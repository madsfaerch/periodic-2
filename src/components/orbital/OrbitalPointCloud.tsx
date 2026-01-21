import { useEffect, useState } from "react";
import * as THREE from "three";
import { getOrbitalPoints } from "@/lib/orbital";
import type { OrbitalPoints, ValenceOrbital } from "@/lib/orbital";

interface OrbitalPointCloudProps {
  orbital: ValenceOrbital;
  positiveColor?: string;
  negativeColor?: string;
  size?: number;
}

// Create an ink-like dot texture with soft feathered edges
function createInkTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  // Create a soft radial gradient that looks like ink bleeding into paper
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.9)");
  gradient.addColorStop(0.6, "rgba(255, 255, 255, 0.5)");
  gradient.addColorStop(0.8, "rgba(255, 255, 255, 0.15)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Singleton texture
let inkTexture: THREE.Texture | null = null;
function getInkTexture(): THREE.Texture {
  if (!inkTexture) {
    inkTexture = createInkTexture();
  }
  return inkTexture;
}

export function OrbitalPointCloud({
  orbital,
  positiveColor = "#0891b2", // Darker cyan/teal
  negativeColor = "#a21caf", // Darker magenta/purple
  size = 0.03,
}: OrbitalPointCloudProps) {
  const [points, setPoints] = useState<OrbitalPoints | null>(null);

  useEffect(() => {
    let cancelled = false;

    getOrbitalPoints(orbital).then((data) => {
      if (!cancelled) {
        setPoints(data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [orbital]);

  const texture = getInkTexture();

  if (!points || points.count === 0) {
    return null;
  }

  const posColor = new THREE.Color(positiveColor);
  const negColor = new THREE.Color(negativeColor);

  const colorArray: number[] = [];
  for (let i = 0; i < points.count; i++) {
    const sign = points.signs[i];
    const color = sign >= 0 ? posColor : negColor;
    colorArray.push(color.r, color.g, color.b);
  }
  const colors = new Float32Array(colorArray);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points.positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.85}
        depthWrite={false}
        blending={THREE.NormalBlending}
        map={texture}
        alphaMap={texture}
      />
    </points>
  );
}
