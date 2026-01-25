import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import * as Astronomy from "astronomy-engine";
import { getVisualPosition, SCALING_CONFIG } from "../utils/scaling";

export default function Planet({ data }) {
  const groupRef = useRef();

  // Calculate radius based on the diameter from the JSON data
  const radius = Math.pow(10, -2) * data.diameter;

  // FIX: Access the correct path from the JSON structure: _3d.textures.base
  // Fallback to a default texture if the path is missing
  const texturePath =
    data._3d?.textures?.base || "/textures/default_planet.jpg";
  const texture = useTexture(texturePath);

  useFrame(({ clock }) => {
    // Time-based position calculation using astronomy-engine
    const date = new Date(
      Date.now() + clock.elapsedTime * 1000 * SCALING_CONFIG.TIME_SPEED,
    );

    // Uses data.name (e.g., "Earth", "Mars") to fetch planetary position
    const posAu = Astronomy.HelioVector(data.name, date);
    const [x, y, z] = getVisualPosition(posAu);

    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
      // Continuous rotation on the Y-axis
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.2} />
      </mesh>

      <Html distanceFactor={20} position={[0, radius + 2, 0]} center>
        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "white",
            background: "rgba(0,0,0,0.8)",
            padding: "5px 12px",
            borderRadius: "4px",
            border: `1px solid ${data.color || "white"}`,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {data.name}
        </div>
      </Html>
    </group>
  );
}
