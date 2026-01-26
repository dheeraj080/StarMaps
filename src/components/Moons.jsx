import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { SCALING_CONFIG } from "../utils/scaling";

const DEG2RAD = Math.PI / 180;

// --- Visual tuning ---
const MOON_LOG_DISTANCE_SCALE = 14; // smaller than planets
const MOON_LOG_SIZE_SCALE = 0.35; // non-linear size
const MIN_CLEARANCE_MULT = 2.2; // planetRadius * this (prevents clipping)
const EXTRA_CLEARANCE = 2.0; // constant padding (scene units)
const ORBIT_SPEED_MULT = 0.6; // slow down visually

function scaleMoonDistanceKmToScene(km) {
  // Non-linear distance compression for moon distances (km)
  return Math.log10(km + 1) * MOON_LOG_DISTANCE_SCALE;
}

function scaleMoonRadiusKmToScene(radiusKm) {
  // Non-linear size mapping: log keeps small moons visible
  return Math.log10(radiusKm + 1) * MOON_LOG_SIZE_SCALE;
}

export default function Moon({ satelliteData, parentVisualRadius = 10 }) {
  const moonRef = useRef();

  const texturePath =
    satelliteData._3d?.textures?.base || "/textures/default_moon.jpg";
  const texture = useTexture(texturePath);

  // --- Visual radius (non-linear) ---
  const visualRadius = useMemo(() => {
    const radiusKm = (satelliteData.diameter || 1) / 2;
    // Keep a minimum size so tiny moons don’t vanish
    return Math.max(0.6, scaleMoonRadiusKmToScene(radiusKm));
  }, [satelliteData.diameter]);

  // --- Orbit distance (non-linear + clearance so it never clips parent) ---
  const orbitRadius = useMemo(() => {
    const dKm = satelliteData.distanceFromParent || 1;
    const raw = scaleMoonDistanceKmToScene(dKm);

    const minSafe =
      parentVisualRadius * MIN_CLEARANCE_MULT + visualRadius + EXTRA_CLEARANCE;

    return Math.max(raw, minSafe);
  }, [satelliteData.distanceFromParent, parentVisualRadius, visualRadius]);

  // --- Orbit plane tilt (optional but helps avoid overlaps) ---
  const inclinationRad = useMemo(() => {
    const inc = satelliteData.orbitalInclination || 0;
    return inc * DEG2RAD;
  }, [satelliteData.orbitalInclination]);

  // Slightly different planes per moon to reduce collisions
  const orbitPlane = useMemo(() => {
    // Tilt around X by inclination, and add a tiny Y tilt based on id for variety
    const jitter = (String(satelliteData.id || "").charCodeAt(0) || 1) * 0.0005;
    const m = new THREE.Matrix4()
      .makeRotationX(inclinationRad)
      .multiply(new THREE.Matrix4().makeRotationY(jitter));
    return m;
  }, [inclinationRad, satelliteData.id]);

  // --- Geometry detail (cap segments for performance) ---
  const segments = useMemo(() => {
    const s = Math.round(visualRadius * 10) + 12;
    return Math.min(48, Math.max(16, s));
  }, [visualRadius]);

  useFrame(({ clock }) => {
    if (!moonRef.current) return;

    // Period in days from JSON; fallback to Moon ~27.3 days
    const period = satelliteData.orbitalPeriod || 27.3;
    const orbitSpeed = (2 * Math.PI) / period;

    // Time simulation
    const t =
      clock.elapsedTime *
      orbitSpeed *
      ORBIT_SPEED_MULT *
      (SCALING_CONFIG?.TIME_SPEED ? 0.001 : 1); // keep stable if TIME_SPEED is huge

    // Base orbit in XZ plane
    const local = new THREE.Vector3(
      Math.cos(t) * orbitRadius,
      0,
      Math.sin(t) * orbitRadius,
    );

    // Tilt orbit plane
    local.applyMatrix4(orbitPlane);

    moonRef.current.position.copy(local);

    // Slow spin
    moonRef.current.rotation.y += 0.003;
  });

  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[visualRadius, segments, segments]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.85}
        metalness={0.05}
        emissive={new THREE.Color("#ffffff")}
        emissiveIntensity={0.12}
      />
    </mesh>
  );
}
