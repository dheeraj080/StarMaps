import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as satellite from "satellite.js";
import { SCALING_CONFIG } from "../utils/scaling";

// Example TLE for the ISS (This changes daily!)
const ISS_TLE = [
  "1 25544U 98067A   23234.54581410  .00016717  00000-0  30176-3 0  9990",
  "2 25544  51.6416  20.3546 0005708 261.3234 168.3204 15.49547524412215",
];

export default function Satellite({ earthRef, tle = ISS_TLE, color = "cyan" }) {
  const satRef = useRef();
  const satrec = satellite.twoline2satrec(tle[0], tle[1]);

  useFrame(({ clock }) => {
    if (!earthRef.current || !satRef.current) return;

    // 1. Get Satellite Position relative to Earth (ECI coordinates)
    const now = new Date();
    const positionAndVelocity = satellite.propagate(satrec, now);
    const posEci = positionAndVelocity.position; // in km

    if (posEci) {
      // 2. Local Scaling
      // Note: Because we blew up the Earth size with CELESTIAL_SCALE,
      // we must scale the satellite distance similarly to keep it outside the crust.
      const localScale = SCALING_CONFIG.celestialScale * 1.2;

      const relX = posEci.x * localScale;
      const relY = posEci.y * localScale;
      const relZ = posEci.z * localScale;

      // 3. Global Position = Earth Center + Relative Satellite Position
      const earthPos = earthRef.current.position;
      satRef.current.position.set(
        earthPos.x + relX,
        earthPos.y + relY,
        earthPos.z + relZ,
      );
    }
  });

  return (
    <mesh ref={satRef}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}
