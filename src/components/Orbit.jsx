import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as Astronomy from "astronomy-engine";
import { getVisualVector } from "../utils/scaling";

const ORBIT_Y_OFFSET = 0.02;

export default function Orbit({
  planetName,
  color = "white",
  orbitalPeriodDays = 365.25,
  finalOrbitRadius,
  segments = 256,
}) {
  const points = useMemo(() => {
    const pts = [];
    const baseDate = new Date(Date.UTC(2000, 0, 1));
    const period = Number(orbitalPeriodDays) || 365.25;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const sampleDate = new Date(baseDate.getTime() + t * period * 86400000);

      const posAu = Astronomy.HelioVector(planetName, sampleDate);
      const { direction } = getVisualVector(posAu);

      const p = direction.clone().multiplyScalar(finalOrbitRadius);
      p.y += ORBIT_Y_OFFSET;
      pts.push(p);
    }

    return pts;
  }, [planetName, orbitalPeriodDays, finalOrbitRadius, segments]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.35}
      depthWrite={false}
    />
  );
}
