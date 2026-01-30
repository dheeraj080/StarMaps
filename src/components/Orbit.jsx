import React, { useMemo } from "react";
import * as Astronomy from "astronomy-engine";
import * as THREE from "three";
import { SCALING_CONFIG } from "../utils/scaling";

export default function Orbit({ planetName, color, orbitalPeriodDays }) {
  const orbitPoints = useMemo(() => {
    const points = [];
    const numPoints = 500;
    const logScale = 25000; // Must match the hook exactly
    const period = orbitalPeriodDays || 365;
    const refDate = new Date(Date.UTC(2000, 0, 1));

    for (let i = 0; i < numPoints; i++) {
      const dayOffset = (i / numPoints) * period;
      const date = new Date(
        refDate.getTime() + dayOffset * 24 * 60 * 60 * 1000,
      );

      const posAu = Astronomy.HelioVector(planetName, date);

      // Calculate distance and apply log
      const rawDistance = Math.sqrt(posAu.x ** 2 + posAu.y ** 2 + posAu.z ** 2);
      const visualDistance = Math.log10(rawDistance + 1) * logScale;

      // Map to 3D space
      const direction = new THREE.Vector3(
        posAu.x,
        posAu.z,
        posAu.y,
      ).normalize();
      points.push(direction.multiplyScalar(visualDistance));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [planetName, orbitalPeriodDays]);

  return (
    // 3. Use lineLoop to automatically close the gap between last and first point
    <lineLoop geometry={orbitPoints}>
      <lineBasicMaterial
        color={color || "#555555"}
        transparent
        opacity={0.2}
        linewidth={1}
      />
    </lineLoop>
  );
}
