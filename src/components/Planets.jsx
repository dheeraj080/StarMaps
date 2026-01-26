import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import * as Astronomy from "astronomy-engine";
import * as THREE from "three";
import { getVisualVector, SCALING_CONFIG } from "../utils/scaling";
import Moon from "./Moons";
import Orbit from "./Orbit";

const ORBIT_PADDING_FACTOR = 5; // visual spacing multiplier
const SAFE_GAP = 1500; // tiny extra separation (log-space safe)
const SYSTEM_START_OFFSET = 100;

export default function Planet({ data }) {
  const groupRef = useRef();

  // --- VISUAL PLANET SIZE (non-linear, size-aware) ---
  const visualRadius = useMemo(() => {
    return Math.pow(data.diameter, 0.4) * 10;
  }, [data.diameter]);

  const texture = useTexture(
    data._3d?.textures?.base || "/textures/default_planet.jpg",
  );

  // --- STABLE ORBIT RADIUS (log-scaled + size-aware) ---
  const finalOrbitRadius = useMemo(() => {
    const posAu = Astronomy.HelioVector(data.name, new Date());
    const { radius } = getVisualVector(posAu);

    return radius * 2 + (data.index || 0) * SAFE_GAP;
  }, [data.name, data.index]);

  // --- FRAME UPDATE ---
  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const date = new Date(
      Date.now() + clock.elapsedTime * 1000 * SCALING_CONFIG.TIME_SPEED,
    );

    const posAu = Astronomy.HelioVector(data.name, date);
    const { direction } = getVisualVector(posAu);

    // Preserve full 3D direction (NO axis flattening)
    groupRef.current.position.copy(
      direction.clone().multiplyScalar(finalOrbitRadius),
    );

    // Gentle axial spin
    groupRef.current.rotation.y += 0.002;
  });

  return (
    <>
      {/* ORBIT RING
      <Orbit radius={finalOrbitRadius} color={data.color} />
       */}

      {/* PLANET GROUP */}
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[visualRadius, 64, 64]} />
          <meshStandardMaterial map={texture} roughness={0.7} metalness={0.2} />
        </mesh>

        {/* PLANET LABEL */}
        <Html
          position={[0, visualRadius + 20, 0]}
          center
          distanceFactor={1000}
          occlude={false}
          zIndexRange={[100, 0]}
          sprite
        >
          <div
            style={{
              fontSize: "40px",
              fontWeight: "bold",
              color: "white",
              background: "rgba(0,0,0,0.8)",
              padding: "8px 20px",
              borderRadius: "8px",
              border: `2px solid ${data.color || "white"}`,
              whiteSpace: "nowrap",
              willChange: "transform",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {data.name}
          </div>
        </Html>

        {/* MOONS 
        {data.satellites?.map((moon) => (
          <Moon
            key={moon.id}
            satelliteData={moon}
            parentVisualRadius={visualRadius}
          />
        ))}

          */}
      </group>
    </>
  );
}
