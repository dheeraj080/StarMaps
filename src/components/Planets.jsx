import React, { useRef, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber"; // Added useThree
import { Html, useTexture } from "@react-three/drei";
import * as Astronomy from "astronomy-engine";
import * as THREE from "three";
import { getVisualVector, SCALING_CONFIG } from "../utils/scaling";
import Moon from "./Moons";
import Orbit from "./Orbit";
import { easing } from "maath";

const ORBIT_PADDING_FACTOR = 5;
const SAFE_GAP = 5000;
const SYSTEM_START_OFFSET = 100;

export default function Planet({ data }) {
  const groupRef = useRef();
  const { camera, controls } = useThree();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // --- VISUAL PLANET SIZE ---
  const visualRadius = useMemo(() => {
    return Math.pow(data.diameter, 0.4) * 10;
  }, [data.diameter]);

  const texture = useTexture(
    data._3d?.textures?.base || "/textures/default_planet.jpg",
  );

  // --- STABLE ORBIT RADIUS ---
  const finalOrbitRadius = useMemo(() => {
    const posAu = Astronomy.HelioVector(data.name, new Date());
    const { radius } = getVisualVector(posAu);
    return radius * 2 + (data.index || 0) * SAFE_GAP;
  }, [data.name, data.index]);

  // --- CLICK HANDLER (Moved outside useFrame) ---
  const handlePlanetClick = (e) => {
    e.stopPropagation(); // Stop click from hitting things behind the planet

    const targetPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(targetPos);

    // 1. Move the center of rotation to the planet
    controls.target.set(targetPos.x, targetPos.y, targetPos.z);

    // 2. Adjust camera position to be nearby
    const offset = new THREE.Vector3(0, visualRadius * 2, visualRadius * 6);
    camera.position.copy(targetPos.clone().add(offset));

    // 3. Essential for OrbitControls to recognize the manual jump
    controls.update();
  };

  // --- FRAME UPDATE ---
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. Planet Movement Logic
    const date = new Date(
      Date.now() + state.clock.elapsedTime * 1000 * SCALING_CONFIG.TIME_SPEED,
    );
    const posAu = Astronomy.HelioVector(data.name, date);
    const { direction } = getVisualVector(posAu);

    groupRef.current.position.copy(
      direction.clone().multiplyScalar(finalOrbitRadius),
    );

    // 2. Smooth Fly-In Logic (The "Event" Movement)
    if (isTransitioning && controls) {
      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);

      // Move the OrbitControls focal point
      easing.damp3(controls.target, worldPos, 0.3, delta);

      // Move camera to a nice viewing distance
      const offset = new THREE.Vector3(0, visualRadius * 2, visualRadius * 6);
      const idealPos = worldPos.clone().add(offset);
      easing.damp3(state.camera.position, idealPos, 0.3, delta);

      // check if we are "close enough" to stop the transition
      const dist = state.camera.position.distanceTo(idealPos);
      if (dist < 1) {
        setIsTransitioning(false); // Release the "lock"
      }
    }

    groupRef.current.rotation.y += 0.002;
  });

  return (
    <>
      <group ref={groupRef}>
        <mesh onClick={handlePlanetClick} style={{ cursor: "pointer" }}>
          <sphereGeometry args={[visualRadius, 64, 64]} />
          <meshStandardMaterial map={texture} roughness={0.7} metalness={0.2} />
        </mesh>

        <Html
          position={[0, visualRadius + 20, 0]}
          center
          distanceFactor={1000}
          sprite
          // Make the label clickable too!
          pointerEvents="auto"
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
            }}
          >
            {data.name}
          </div>
        </Html>
      </group>
    </>
  );
}
