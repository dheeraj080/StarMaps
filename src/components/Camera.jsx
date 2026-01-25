import React from "react";
import { OrbitControls, Stars } from "@react-three/drei";

export default function SolarCamera() {
  return (
    <>
      <OrbitControls
        makeDefault
        enableDamping
        maxDistance={1000000} // Increased for linear distances
        minDistance={50}
      />

      <Stars radius={20000} depth={2000} count={20000} factor={7} fade />

      <ambientLight intensity={0.2} />
      {/* Increased intensity and distance to reach the outer planets */}
      <pointLight
        position={[0, 0, 0]}
        intensity={5000}
        distance={1000000}
        decay={1}
      />
    </>
  );
}
