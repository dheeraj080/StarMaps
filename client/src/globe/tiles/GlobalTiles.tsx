import React, { useMemo } from "react";
import { Tile } from "./Tile";

type Props = {
  radius: number;
  urlTemplate: string;
  z?: number; // 1..3 recommended
};

export function GlobalTiles({ radius, urlTemplate, z = 2 }: Props) {
  const tiles = useMemo(() => {
    const n = 2 ** z;
    const out: Array<{ z: number; x: number; y: number; key: string }> = [];
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        out.push({ z, x, y, key: `${z}/${x}/${y}` });
      }
    }
    return out;
  }, [z]);

  return (
    <group>
      {tiles.map((t) => (
        <React.Suspense key={t.key} fallback={null}>
          <Tile
            z={t.z}
            x={t.x}
            y={t.y}
            radius={radius}
            urlTemplate={urlTemplate}
            segments={10} // low-res mesh
            radiusMul={1.002} // sits just above base sphere
          />
        </React.Suspense>
      ))}
    </group>
  );
}
