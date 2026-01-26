import React, { useMemo } from "react";
import * as THREE from "three";

export default function Orbit({ radius, color }) {
  // This creates a single, clean circle geometry centered at [0,0,0]
  const geometry = useMemo(() => {
    const pts = [];
    const segments = 128; // Smoothness

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius,
        ),
      );
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={color || "#ffffff"}
        transparent
        opacity={0.25}
        linewidth={1}
      />
    </line>
  );
}
