import React, { Suspense } from "react";
import { useTexture } from "@react-three/drei";
import { useMoonLogic } from "../hooks/useMoonLogic";

function MoonMesh({ satelliteData, parentVisualRadius }) {
  // Use 'moonRef' to match your latest hook logic
  const { moonRef, moonRadius, inclinationRad, orbitRadius } = useMoonLogic(
    satelliteData,
    parentVisualRadius,
  );

  const textureUrl = satelliteData?._3d?.textures?.base;
  // Use a fallback or conditional to avoid 'url is undefined' errors
  const map = useTexture(textureUrl || "/textures/planets/moon_default.jpg");

  return (
    // Step 1: Tilt the entire orbital plane
    <group rotation={[inclinationRad, 0, 0]}>
      {/* Optional: Visual Orbit Path */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius, orbitRadius + 0.3, 128]} />
        <meshBasicMaterial color="white" transparent opacity={0.05} />
      </mesh>

      {/* Step 2: The Moon itself */}
      {/* moonRef handles BOTH position AND tidal rotation */}
      <mesh
        ref={moonRef}
        castShadow
        receiveShadow
        name={`moon-${satelliteData?.name || "moon"}`}
      >
        <sphereGeometry args={[moonRadius, 32, 32]} />
        <meshStandardMaterial map={map} roughness={0.9} metalness={0.02} />
      </mesh>
    </group>
  );
}

// Wrapped in Suspense because useTexture is an async hook
export default function Moon(props) {
  return (
    <Suspense fallback={null}>
      <MoonMesh {...props} />
    </Suspense>
  );
}
