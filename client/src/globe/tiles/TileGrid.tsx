import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Tile } from "./Tile";
import { clamp, latLonToTileXY } from "./tileMath";

type Props = {
  radius: number;
  urlTemplate: string;
  ring?: number; // 2 -> 5x5 tiles
  minZoom?: number;
  maxZoom?: number;
};

function ecefToLatLon(p: THREE.Vector3) {
  const r = p.length();
  const lat = (Math.asin(p.y / r) * 180) / Math.PI;
  const lon = (Math.atan2(p.z, p.x) * 180) / Math.PI;
  return { lat, lon };
}

export function TileGrid({
  radius,
  urlTemplate,
  ring = 2,
  minZoom = 1,
  maxZoom = 8,
}: Props) {
  const { camera } = useThree();
  const [center, setCenter] = useState({ z: 2, x: 0, y: 0 });

  // update at ~5Hz (not every frame) for stability
  useFrame((_, dt) => {
    (useFrame as any)._acc = ((useFrame as any)._acc ?? 0) + dt;
    if ((useFrame as any)._acc < 0.2) return;
    (useFrame as any)._acc = 0;

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);

    const origin = camera.position.clone();
    const a = dir.dot(dir);
    const b = 2 * origin.dot(dir);
    const c = origin.dot(origin) - radius * radius;
    const disc = b * b - 4 * a * c;
    if (disc <= 0) return;

    const t = (-b - Math.sqrt(disc)) / (2 * a);
    if (t <= 0) return;

    const hit = origin.add(dir.multiplyScalar(t));
    const { lat, lon } = ecefToLatLon(hit);

    const dist = camera.position.length();
    const z = clamp(Math.round(5 - Math.log2(dist / radius)), minZoom, maxZoom);
    const { x, y } = latLonToTileXY(lat, lon, z);

    setCenter((prev) =>
      prev.z === z && prev.x === x && prev.y === y ? prev : { z, x, y },
    );
  });

  const tiles = useMemo(() => {
    const n = 2 ** center.z;

    // Prevent duplicates at low zoom: ring cannot exceed available tiles
    const rx = Math.min(ring, Math.floor((n - 1) / 2));
    const ry = Math.min(ring, Math.floor((n - 1) / 2));

    const map = new Map<
      string,
      { z: number; x: number; y: number; key: string }
    >();

    for (let dy = -ry; dy <= ry; dy++) {
      for (let dx = -rx; dx <= rx; dx++) {
        const x = (center.x + dx + n) % n;
        const y = clamp(center.y + dy, 0, n - 1);

        const key = `${center.z}/${x}/${y}`;
        if (!map.has(key)) {
          map.set(key, { z: center.z, x, y, key });
        }
      }
    }

    return Array.from(map.values());
  }, [center, ring]);

  console.log("TileGrid center:", center, "tiles:", tiles.length);

  return (
    <group>
      {tiles.map((t) => (
        <React.Suspense
          key={t.key}
          fallback={
            <mesh>
              <sphereGeometry args={[0.001, 4, 4]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          }
        >
          <Tile
            z={t.z}
            x={t.x}
            y={t.y}
            radius={radius}
            urlTemplate={urlTemplate}
            segments={24} // higher-res mesh for close view
            radiusMul={1.01} // sits above base tiles
          />
        </React.Suspense>
      ))}
    </group>
  );
}
