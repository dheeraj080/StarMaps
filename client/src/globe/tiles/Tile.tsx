import * as THREE from "three";
import React, { useMemo } from "react";
import { TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";
import { latLonToUnitSphere } from "./tileMath";

type Props = {
  z: number;
  x: number;
  y: number;
  radius: number;
  urlTemplate: string;
  segments?: number;
  radiusMul?: number;
};

// XYZ tile -> lon in degrees
function tileXFToLonDeg(xf: number, z: number) {
  const n = 2 ** z;
  return (xf / n) * 360 - 180;
}

// XYZ tile -> lat in degrees (inverse WebMercator)
function tileYFToLatDeg(yf: number, z: number) {
  const n = 2 ** z;
  const t = Math.PI * (1 - 2 * (yf / n));
  const latRad = Math.atan(Math.sinh(t));
  return (latRad * 180) / Math.PI;
}

export function Tile({
  z,
  x,
  y,
  radius,
  urlTemplate,
  segments = 24,
  radiusMul = 1.01,
}: Props) {
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

  // Avoid edge bleeding (helps seams)
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;

  const geom = useMemo(() => {
    const r = radius * radiusMul;

    const g = new THREE.BufferGeometry();
    const verts: number[] = [];
    const uvs: number[] = [];
    const idx: number[] = [];

    // Build vertices by sampling the *tile's projection space*
    for (let j = 0; j <= segments; j++) {
      const v = j / segments;

      // fractional tile Y coordinate (global tile space)
      const yf = y + v;
      const lat = tileYFToLatDeg(yf, z);

      for (let i = 0; i <= segments; i++) {
        const u = i / segments;

        // fractional tile X coordinate (global tile space)
        const xf = x + u;
        const lon = tileXFToLonDeg(xf, z);

        const p = latLonToUnitSphere(lat, lon);
        verts.push(p.x * r, p.y * r, p.z * r);

        // Your requested X-flip only:
        uvs.push(u, 1 - v);
      }
    }

    // Indices (outward winding)
    const row = segments + 1;
    for (let j = 0; j < segments; j++) {
      for (let i = 0; i < segments; i++) {
        const a = j * row + i;
        const b = a + 1;
        const c = a + row;
        const d = c + 1;

        idx.push(a, b, c);
        idx.push(b, d, c);
      }
    }

    g.setIndex(idx);
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.computeVertexNormals();
    return g;
  }, [z, x, y, radius, radiusMul, segments]);

  return (
    <mesh geometry={geom} frustumCulled={false}>
      <meshBasicMaterial map={tex} />
    </mesh>
  );
}
