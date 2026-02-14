import React, { useEffect, useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import * as satellite from "satellite.js";

// -- Types for your API data --
type SatelliteRecord = {
  id: number;
  name: string;
  line1: string;
  line2: string;
};

// -- Helper to scale km to game units --
const EARTH_RADIUS_KM = 6371;
const GAME_UNITS = 6.371; // Matches your GlobeScene radius
const SCALE = GAME_UNITS / EARTH_RADIUS_KM;

export function SatelliteLayer() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [data, setData] = useState<SatelliteRecord[]>([]);

  // 1. Fetch Data from FastAPI
  useEffect(() => {
    fetch("http://localhost:8000/api/satellites/?limit=5000")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to fetch sats:", err));
  }, []);

  // 2. Pre-parse TLEs (Optimization: do this once, not every frame)
  const satRecs = useMemo(() => {
    return data.map((rec) => ({
      satrec: satellite.twoline2satrec(rec.line1, rec.line2),
      ...rec,
    }));
  }, [data]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 3. Animation Loop (Runs 60fps)
  useFrame(() => {
    if (!meshRef.current || satRecs.length === 0) return;

    const now = new Date();

    satRecs.forEach((sat, i) => {
      // Propagate orbit to get position
      const positionAndVelocity = satellite.propagate(sat.satrec, now);

      if (
        positionAndVelocity.position &&
        typeof positionAndVelocity.position !== "boolean"
      ) {
        // Convert ECI (Earth Centered Inertial) -> Three.js
        // satellite.js gives X=Greenwich, but Earth rotates.
        // For a simple viz, we map directly, but for precision we need gmst.
        // For now: Simple Viz Mapping (x, z, -y for Y-up systems usually)
        const gmst = satellite.gstime(now);
        const positionGd = satellite.eciToEcf(
          positionAndVelocity.position,
          gmst,
        );

        if (positionGd.x) {
          const x = positionGd.x * SCALE;
          const y = positionGd.y * SCALE;
          const z = positionGd.z * SCALE;

          // In Three.js, Y is typically Up. ECEF Z is North.
          // Mapping: ECEF X -> 3D X, ECEF Z -> 3D Y, ECEF Y -> 3D -Z
          dummy.position.set(x, z, -y);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(0.02, 0.02, 0.02); // Tiny dots
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i, dummy.matrix);
        }
      }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, satRecs.length]}
      frustumCulled={false} // Satellites move fast, don't cull
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#00ff00" />
    </instancedMesh>
  );
}
