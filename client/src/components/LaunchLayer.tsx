import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { apiGet } from "../api/client";
import { latLonToUnitSphere } from "../globe/tiles/tileMath";

type Launch = {
  id: string;
  name: string;
  net_utc: string;
  pad_lat: number;
  pad_lon: number;
};

type Resp = { results: Launch[] };

export function LaunchesLayer({ radius }: { radius: number }) {
  const [launches, setLaunches] = useState<Launch[]>([]);

  useEffect(() => {
    apiGet<Resp>("/api/launches/upcoming")
      .then((d) => setLaunches(d.results))
      .catch((e) => console.error("launches fetch failed", e));
  }, []);

  return (
    <group>
      {launches
        .filter((l) => Number.isFinite(l.pad_lat) && Number.isFinite(l.pad_lon))
        .map((l) => {
          const p = latLonToUnitSphere(l.pad_lat, l.pad_lon);
          const r = radius * 1.02; // lift above globe
          return (
            <mesh
              key={l.id}
              position={new THREE.Vector3(p.x * r, p.y * r, p.z * r)}
            >
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial />
            </mesh>
          );
        })}
    </group>
  );
}
