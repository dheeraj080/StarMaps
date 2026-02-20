import React, { useMemo } from "react";
import * as THREE from "three";
import * as satellite from "satellite.js";

interface OrbitPathProps {
  satrec: any;
  scale: number;
}

export function OrbitPath({ satrec, scale }: { satrec: any; scale: number }) {
  const points = useMemo(() => {
    // CRITICAL: Ensure satellite record is initialized
    if (!satrec || !satrec.error === undefined) return [];

    const pathPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 90; i += 2) {
      const date = new Date(Date.now() + i * 60000);
      const posVel = satellite.propagate(satrec, date);
      if (posVel.position && typeof posVel.position !== "boolean") {
        const gmst = satellite.gstime(date);
        const posGd = satellite.eciToEcf(posVel.position, gmst);
        pathPoints.push(
          new THREE.Vector3(posGd.x * scale, posGd.z * scale, -posGd.y * scale),
        );
      }
    }
    return pathPoints;
  }, [satrec, scale]);

  if (points.length < 2) return null;

  return (
    <line>
      <bufferGeometry
        attach="geometry"
        onUpdate={(self) => self.setFromPoints(points)}
      />
      <lineBasicMaterial color="#00f2ff" transparent opacity={0.3} />
    </line>
  );
}
