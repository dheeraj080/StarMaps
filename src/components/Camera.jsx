import React from "react";
import { OrbitControls, Stars } from "@react-three/drei";

export default function Camera() {
  return (
    <>
      <OrbitControls
        makeDefault
        // --- BLENDER PHYSICS ---
        enableDamping={true} // Provides that "weight"
        dampingFactor={0.05} // How fast it stops (0.05 is the sweet spot)
        rotateSpeed={0.8} // A bit slower for precision
        panSpeed={1}
        // --- BLENDER BEHAVIOR ---
        zoomToCursor={true} // Zooms where your mouse is, not just center
        screenSpacePanning={true} // Better for 3D navigation
        // --- BOUNDARIES ---
        maxDistance={1000000}
        minDistance={50}
      />

      <Stars radius={100000} depth={5000} count={20000} factor={7} fade />

      <ambientLight intensity={0.4} />
      <pointLight
        position={[0, 0, 0]}
        intensity={8000}
        distance={2000000}
        decay={1}
      />
    </>
  );
}
