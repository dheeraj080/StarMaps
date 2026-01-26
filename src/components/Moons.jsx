import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { radiusScale, SCALING_CONFIG } from "../utils/scaling";

export default function Moon({ satelliteData }) {
  const moonRef = useRef();

  // 1. Implementation of createThreediameter()
  // Uses the < 300km "boost" logic and divides by 2 for diameter
  const diameter = useMemo(() => {
    if (satelliteData.diameter < 300) {
      return satelliteData.diameter * 0.0007;
    }
    return satelliteData.diameter * radiusScale;
  }, [satelliteData.diameter]);

  // 2. Load texture
  const texturePath =
    satelliteData._3d?.textures?.base || "/textures/default_moon.jpg";
  const texture = useTexture(texturePath);

  // 3. Dynamic Segments based on size (Implementation of your segmentsOffset logic)
  const segments = useMemo(() => {
    return Math.floor(diameter * 2 + 1 * 35);
  }, [diameter]);

  useFrame(({ clock }) => {
    if (moonRef.current) {
      // 4. Implementation of createThreeDistanceFromParent()
      // Uses the standard orbit scale (10^-4.2)
      //const orbitScale = Math.pow(10, -2.2);
      //const distance = satelliteData.distanceFromParent * orbitScale;

      const distance = Math.log10(satelliteData.distanceFromParent + 1) * 40;

      // 5. Orbital Speed logic (Slowed down for visual comfort)
      const orbitSpeed = (2 * Math.PI) / (satelliteData.orbitalPeriod || 27.3);
      const angle = clock.elapsedTime * orbitSpeed * 0.5;

      // 6. Set local position relative to the planet center
      moonRef.current.position.set(
        Math.cos(angle) * distance,
        0, // You can add Math.sin(angle) * inclination if you want 3D orbits
        Math.sin(angle) * distance,
      );

      // 7. Slowed Rotation (Implementation of "slower rotation" request)
      moonRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={moonRef}>
      {/* Dynamic geometry based on moon size */}
      <sphereGeometry args={[diameter, segments, segments]} />

      {/* Implementation of MeshLambertMaterial equivalent for performance */}
      <meshStandardMaterial
        map={texture}
        roughness={0.8}
        metalness={0.1}
        emissive={new THREE.Color("#ffffff")}
        emissiveIntensity={0.15} // Ensures small moons are visible in shadow
      />
    </mesh>
  );
}
