import React, { useRef, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import * as Astronomy from "astronomy-engine";
import * as THREE from "three";
import { getVisualVector, SCALING_CONFIG } from "../utils/scaling";
import Moon from "./Moons";
import Orbit from "./Orbit";
import { easing } from "maath";

const SAFE_GAP = 5000;
const ORBIT_PADDING_FACTOR = 5.5;

export default function Planet({ data }) {
  const groupRef = useRef();
  const { controls } = useThree();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Visual planet size (keep your current formula)
  const visualRadius = useMemo(() => {
    return Math.pow(data.diameter, 0.4) * 25;
  }, [data.diameter]);

  const texture = useTexture(
    data._3d?.textures?.base || "/textures/default_planet.jpg",
  );

  // ✅ Orbit radius computed INSIDE planet (old behavior)
  const finalOrbitRadius = useMemo(() => {
    const posAu = Astronomy.HelioVector(
      data.name,
      new Date(Date.UTC(2000, 0, 1)),
    );
    const { radius } = getVisualVector(posAu);

    return (
      radius * 2 +
      visualRadius * ORBIT_PADDING_FACTOR +
      (data.index || 0) * SAFE_GAP
    );
  }, [data.name, data.index, visualRadius]);

  const handlePlanetClick = (e) => {
    e.stopPropagation();
    setIsTransitioning(true);
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const date = new Date(
      Date.now() + state.clock.elapsedTime * 1000 * SCALING_CONFIG.TIME_SPEED,
    );

    const posAu = Astronomy.HelioVector(data.name, date);
    const { direction } = getVisualVector(posAu);

    // ✅ Put planet on its orbit ring band (same as before)
    groupRef.current.position.copy(
      direction.clone().multiplyScalar(finalOrbitRadius),
    );

    // Optional smooth fly-to behavior (kept)
    if (isTransitioning && controls) {
      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);

      easing.damp3(controls.target, worldPos, 0.3, delta);

      const offset = new THREE.Vector3(0, visualRadius * 2, visualRadius * 6);
      const idealPos = worldPos.clone().add(offset);
      easing.damp3(state.camera.position, idealPos, 0.3, delta);

      if (state.camera.position.distanceTo(idealPos) < 1) {
        setIsTransitioning(false);
      }
    }

    groupRef.current.rotation.y += 0.002;
  });

  return (
    <>
      <Orbit
        planetName={data.name}
        color={data.color}
        orbitalPeriodDays={data.orbitalPeriod}
        finalOrbitRadius={finalOrbitRadius}
      />

      <group ref={groupRef}>
        <mesh onClick={handlePlanetClick}>
          <sphereGeometry args={[visualRadius, 64, 64]} />
          <meshStandardMaterial map={texture} roughness={0.7} metalness={0.2} />
        </mesh>

        <Html
          position={[0, visualRadius + 20, 0]}
          center
          distanceFactor={1000}
          sprite
          occlude={false}
        >
          <div
            onClick={handlePlanetClick}
            style={{
              fontSize: "40px",
              fontWeight: "bold",
              color: "white",
              background: "rgba(0,0,0,0.8)",
              padding: "8px 20px",
              borderRadius: "8px",
              border: `2px solid ${data.color || "white"}`,
              cursor: "pointer",
              userSelect: "none",
              pointerEvents: "auto",
            }}
          >
            {data.name}
          </div>
        </Html>

        {data.satellites?.map((moon) => (
          <Moon
            key={moon.id}
            satelliteData={moon}
            parentVisualRadius={visualRadius}
          />
        ))}
      </group>
    </>
  );
}
