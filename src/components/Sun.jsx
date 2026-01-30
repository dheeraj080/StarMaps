import React, { useRef } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function Sun({ data }) {
  const meshRef = useRef();

  // 1. Load the texture (ensure the path matches your public folder)
  const texture = useTexture("/textures/sun_detailed.png");

  // 2. Visual radius calculation (kept from your original code)
  const radius = data.diameter * Math.pow(10, -3);

  // 3. Optional: Add a slow rotation to make the texture feel alive
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      {/* The actual light source */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2}
        decay={2} // Use 2 for physical accuracy
        distance={0} // 0 means the light doesn't stop until it hits something
      />
    </group>
  );
}
