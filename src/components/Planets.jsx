import React, { useMemo, useRef, useCallback } from "react";
import { Html, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import Moon from "./Moons";
import Orbit from "./Orbit";
import { usePlanetLogic } from "../hooks/usePlanetLogic";

// Scoped style outside the component to prevent re-creation on render
const getLabelStyle = (borderColor) => ({
  fontSize: "40px",
  fontWeight: 800,
  color: "white",
  background: "rgba(0,0,0,0.85)",
  padding: "10px 24px",
  borderRadius: "12px",
  border: `3px solid ${borderColor || "white"}`,
  cursor: "pointer",
  userSelect: "none",
  pointerEvents: "auto",
  whiteSpace: "nowrap",
  boxShadow: "0px 0px 15px rgba(0,0,0,0.5)",
});

function PlanetAxis({ radius, colorNorth = "cyan", colorSouth = "orange" }) {
  const len = radius * 1.8; // Slightly longer than the visual radius
  return (
    <group name="axis-lines">
      <Line
        points={[
          [0, 0, 0],
          [0, len, 0],
        ]}
        color={colorNorth}
        lineWidth={2}
        transparent
        opacity={0.6}
      />
      <Line
        points={[
          [0, 0, 0],
          [0, -len, 0],
        ]}
        color={colorSouth}
        lineWidth={2}
        transparent
        opacity={0.6}
      />
    </group>
  );
}

export default function Planet({ data }) {
  const {
    groupRef,
    visualRadius,
    finalOrbitRadius,
    texture,
    handlePlanetClick,
    axialTiltRad,
    timeScale = 1, // Normalized timeScale (1 = 1s/day)
  } = usePlanetLogic(data);

  const spinRef = useRef(null);

  // Calculate angular velocity: (2π radians / rotationPeriod) * timeMultiplier
  const spinSpeed = useMemo(() => {
    const period = data?.rotationPeriod || 1; // Default to 1 day if undefined
    return (Math.PI * 2 * timeScale) / period;
  }, [data?.rotationPeriod, timeScale]);

  useFrame((_, delta) => {
    if (spinRef.current) {
      // delta ensures movement is frame-rate independent
      spinRef.current.rotation.y += delta * spinSpeed;
    }
  });

  const emissiveColor = useMemo(() => new THREE.Color("#050505"), []);
  const labelStyle = useMemo(() => getLabelStyle(data?.color), [data?.color]);

  // Position label significantly above the north pole to avoid axis line overlap
  const labelPosition = useMemo(
    () => [0, visualRadius * 2.2, 0],
    [visualRadius],
  );

  const onPlanetClick = useCallback(
    (e) => {
      e?.stopPropagation?.();
      handlePlanetClick(data); // Pass data back to the handler for the "Fly-to" logic
    },
    [handlePlanetClick, data],
  );

  return (
    <>
      <Orbit
        planetName={data.name}
        color={data.color}
        orbitalPeriodDays={data.orbitalPeriod}
        finalOrbitRadius={finalOrbitRadius}
      />

      {/* 1. POSITION GROUP: Position in space (Controlled by Astronomy Engine) */}
      <group ref={groupRef}>
        {/* 2. TILT GROUP: Static tilt applied once */}
        <group rotation={[0, 0, axialTiltRad]}>
          {/* 3. SPIN GROUP: This is what rotates daily */}
          <group ref={spinRef}>
            <PlanetAxis radius={visualRadius} />

            <mesh
              name="planet-mesh"
              onClick={onPlanetClick}
              castShadow
              receiveShadow
            >
              <sphereGeometry args={[visualRadius, 64, 64]} />
              <meshStandardMaterial
                map={texture}
                roughness={0.7}
                metalness={0.1}
                emissive={emissiveColor}
              />
            </mesh>
          </group>
        </group>

        {/* 4. UI LABEL: Always stays "up" relative to the solar system center */}
        <Html position={labelPosition} center sprite distanceFactor={1200}>
          <div
            role="button"
            tabIndex={0}
            onClick={onPlanetClick}
            style={labelStyle}
            aria-label={`Select ${data.name}`}
          >
            {data.name}
          </div>
        </Html>

        {/* 5. MOONS: Nested in position group so they follow the planet,
            but outside the spin group so they don't whip around the planet's surface */}
        {data.satellites?.map((moon) => (
          <Moon
            key={moon.id}
            satelliteData={moon}
            parentVisualRadius={visualRadius}
            timeScale={timeScale}
          />
        ))}
      </group>
    </>
  );
}
