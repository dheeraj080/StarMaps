import React, { useMemo } from "react";
import * as THREE from "three";
import * as satellite from "satellite.js";

interface OrbitPathProps {
  satrec: any;
  scale: number;
}

export function OrbitPath({ satrec, scale }: OrbitPathProps) {
  const points = useMemo(() => {
    const pathPoints: THREE.Vector3[] = [];
    const now = new Date();

    // Calculate 90 minutes of orbit in 2-minute increments
    for (let i = 0; i <= 90; i += 2) {
      const time = new Date(now.getTime() + i * 60000);
      const gmst = satellite.gstime(time);
      const posVel = satellite.propagate(satrec, time);

      if (posVel.position && typeof posVel.position !== "boolean") {
        const posGd = satellite.eciToEcf(posVel.position, gmst);
        pathPoints.push(
          new THREE.Vector3(posGd.x * scale, posGd.z * scale, -posGd.y * scale),
        );
      }
    }
    return pathPoints;
  }, [satrec, scale]);

  const geometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(points),
    [points],
  );

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.4}
        linewidth={1}
      />
    </line>
  );
}
