import React from "react";
import { Canvas } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import { OrbitControls } from "@react-three/drei";

import { GlobalTiles } from "./tiles/GlobalTiles";
import { TileGrid } from "./tiles/TileGrid";
// (optional later) import { GlobeControls } from "../controls/GlobeControls";

export function GlobeScene() {
  const earthRadius = 6.371;
  const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <Canvas
      camera={{
        position: [0, 0, earthRadius * 3],
        fov: 45,
        near: 0.01,
        far: 5000,
      }}
    >
      <OrbitControls enablePan={false} enableDamping dampingFactor={0.08} />

      <ambientLight intensity={1.0} />

      {/* base sphere (never disappears) */}
      <Sphere args={[earthRadius, 64, 64]}>
        <meshBasicMaterial color={"#0b1a2a"} />
      </Sphere>

      {/* always-on low zoom tiles so entire Earth is covered */}
      <GlobalTiles radius={earthRadius} urlTemplate={TILE_URL} z={2} />

      {/* higher zoom tiles near camera look point */}
      <TileGrid
        radius={earthRadius}
        urlTemplate={TILE_URL}
        ring={2}
        minZoom={3}
        maxZoom={8}
      />

      {/* later replace with Cesium-like controls */}
      {/* <GlobeControls radius={earthRadius} /> */}
    </Canvas>
  );
}
