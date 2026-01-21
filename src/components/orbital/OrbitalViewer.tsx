import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OrbitalPointCloud } from "./OrbitalPointCloud";
import {
  parseValenceOrbital,
  getOrbitalDescription,
} from "@/lib/orbital/orbitalParser";
import { cn } from "@/lib/utils";
import type { Element } from "@/data";

interface OrbitalViewerProps {
  element: Element;
  className?: string;
}

export function OrbitalViewer({ element, className }: OrbitalViewerProps) {
  const orbital = useMemo(() => {
    return parseValenceOrbital(element.electron_configuration_semantic);
  }, [element.electron_configuration_semantic]);

  const description = getOrbitalDescription(orbital);

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="w-full shadow aspect-square bg-stone-100 rounded-lg overflow-hidden">
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
          <Suspense fallback={null}>
            <OrbitalPointCloud orbital={orbital} />
          </Suspense>
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={8}
            autoRotate
            autoRotateSpeed={1}
          />
        </Canvas>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {description}
      </p>
    </div>
  );
}
