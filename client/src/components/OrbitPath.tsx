import { useMemo } from "react";
import * as THREE from "three";
import * as satellite from "satellite.js";

interface OrbitPathProps {
  satrec: any;
  scale: number;
}

export function OrbitPath({ satrec, scale }: OrbitPathProps) {
  const points = useMemo(() => {
    // satrec must exist and not have an error flag
    if (!satrec || satrec.error != null) return [];

    const pathPoints: THREE.Vector3[] = [];

    for (let i = 0; i <= 90; i += 2) {
      const date = new Date(Date.now() + i * 60_000);

      const posVel = satellite.propagate(satrec, date);
      if (!posVel || !posVel.position || typeof posVel.position === "boolean") {
        continue;
      }

      const gmst = satellite.gstime(date);
      const posEcf = satellite.eciToEcf(posVel.position, gmst);

      pathPoints.push(
        new THREE.Vector3(
          posEcf.x * scale,
          posEcf.z * scale,
          -posEcf.y * scale,
        ),
      );
    }

    return pathPoints;
  }, [satrec, scale]);

  if (points.length < 2) return null;

  return (
    <line>
      <bufferGeometry onUpdate={(self) => self.setFromPoints(points)} />
      <lineBasicMaterial color="#00f2ff" transparent opacity={0.3} />
    </line>
  );
}
