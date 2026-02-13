import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";

import { TileGrid } from "./TileGrid";

export function GlobeScene() {
  const earthRadius = 6.371;

  return (
    <Canvas camera={{ position: [0, 0, 18], fov: 45, near: 0.01, far: 1000 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />

      <Sphere args={[earthRadius, 64, 64]}>
        <meshStandardMaterial color={"#1b2a3a"} />
      </Sphere>

      <TileGrid
        radius={earthRadius}
        urlTemplate={"https://tile.openstreetmap.org/{z}/{x}/{y}.png"}
        ring={2}
        minZoom={2}
        maxZoom={8}
      />

      <OrbitControls enablePan={false} />
    </Canvas>
  );
}
