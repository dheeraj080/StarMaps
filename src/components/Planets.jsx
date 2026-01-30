import React, { useMemo, useRef, useCallback } from "react";
import { Html, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import Moon from "./Moons";
import Orbit from "./Orbit";
import { usePlanetLogic } from "../hooks/usePlanetLogic";

const getLabelStyle = (borderColor) => ({
  fontSize: "40px",
  fontWeight: 800,
  color: "white",
  background: "rgba(0,0,0,0.8)",
  padding: "8px 20px",
  borderRadius: "10px",
  border: `2px solid ${borderColor || "white"}`,
  cursor: "pointer",
  userSelect: "none",
  pointerEvents: "auto",
  whiteSpace: "nowrap",
});

function PlanetAxis({ radius, colorNorth = "cyan", colorSouth = "orange" }) {
  const len = radius * 1.6;

  return (
    <>
      <Line
        points={[
          [0, 0, 0],
          [0, len, 0],
        ]}
        color={colorNorth}
        lineWidth={3}
      />
      <Line
        points={[
          [0, 0, 0],
          [0, -len, 0],
        ]}
        color={colorSouth}
        lineWidth={2}
      />
    </>
  );
}

export default function Planet({ data }) {
  const {
    groupRef, // orbital position group
    visualRadius,
    finalOrbitRadius,
    texture,
    handlePlanetClick,
    axialTiltRad,
  } = usePlanetLogic(data);

  const spinRef = useRef(null);

  const spinSpeed = data?.rotationSpeed ?? 0.25;

  useFrame((_, delta) => {
    if (spinRef.current) spinRef.current.rotation.y += delta * spinSpeed;
  });

  const emissiveColor = useMemo(() => new THREE.Color("#111111"), []);
  const labelStyle = useMemo(() => getLabelStyle(data?.color), [data?.color]);

  const labelPosition = useMemo(() => {
    const y = Math.max(visualRadius + 20, visualRadius * 1.35);
    return [0, y, 0];
  }, [visualRadius]);

  const onPlanetClick = useCallback(
    (e) => {
      e?.stopPropagation?.();
      handlePlanetClick(e);
    },
    [handlePlanetClick],
  );

  const onLabelKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onPlanetClick(e);
      }
    },
    [onPlanetClick],
  );

  return (
    <>
      <Orbit
        planetName={data.name}
        color={data.color}
        orbitalPeriodDays={data.orbitalPeriod}
        finalOrbitRadius={finalOrbitRadius}
      />

      {/* Main Group: orbital position */}
      <group ref={groupRef}>
        {/* Tilt Group: axial tilt */}
        <group rotation={[0, 0, axialTiltRad]}>
          {/* Spin Group: rotates around the (tilted) Y axis */}
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
                roughness={0.6}
                metalness={0.2}
                emissive={emissiveColor}
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
        </group>

        <Html position={labelPosition} center sprite distanceFactor={1000}>
          <div
            role="button"
            tabIndex={0}
            onClick={onPlanetClick}
            onKeyDown={onLabelKeyDown}
            style={labelStyle}
            aria-label={`Select planet ${data.name}`}
            title={`Select ${data.name}`}
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
