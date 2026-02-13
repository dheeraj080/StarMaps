import * as THREE from "three";
import React, { useMemo } from "react";
import { TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";
import { tileXYToLatLonBounds, latLonToUnitSphere } from "./tileMath";

type Props = {
  z: number;
  x: number;
  y: number;
  radius: number;
  urlTemplate: string;
  segments?: number;
};

export function Tile({ z, x, y, radius, urlTemplate, segments = 16 }: Props) {
  const url = useMemo(
    () =>
      urlTemplate
        .replace("{z}", String(z))
        .replace("{x}", String(x))
        .replace("{y}", String(y)),
    [urlTemplate, z, x, y],
  );

  const tex = useLoader(TextureLoader, url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  const geom = useMemo(() => {
    const { latTop, latBottom, lonLeft, lonRight } = tileXYToLatLonBounds(
      x,
      y,
      z,
    );

    const g = new THREE.BufferGeometry();
    const verts: number[] = [];
    const uvs: number[] = [];
    const idx: number[] = [];

    for (let j = 0; j <= segments; j++) {
      const v = j / segments;
      const lat = THREE.MathUtils.lerp(latTop, latBottom, v);

      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const lon = THREE.MathUtils.lerp(lonLeft, lonRight, u);

        const p = latLonToUnitSphere(lat, lon);
        const r = radius * 1.01;
        verts.push(p.x * r, p.y * r, p.z * r);

        uvs.push(u, 1 - v);
      }
    }

    const row = segments + 1;
    for (let j = 0; j < segments; j++) {
      for (let i = 0; i < segments; i++) {
        const a = j * row + i;
        const b = a + 1;
        const c = a + row;
        const d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }

    g.setIndex(idx);
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.computeVertexNormals();
    return g;
  }, [x, y, z, radius, segments]);

  return (
    <mesh geometry={geom} frustumCulled={false}>
      <meshStandardMaterial map={tex} />
    </mesh>
  );
}
