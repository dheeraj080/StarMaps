import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SIM_CONFIG } from "../utils/SCALING_CONFIG";

export function useMoonLogic(satelliteData, parentVisualRadius) {
  const moonRef = useRef(null);
  const earthRadiusKm = 6378;

  // 1. Stable Random Start Phase
  const startPhase = useMemo(() => {
    const seed = satelliteData?.name || "moon";
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
    return (Math.abs(hash) % 360) * (Math.PI / 180);
  }, [satelliteData?.name]);

  const thetaRef = useRef(startPhase);

  // 2. Advanced Scaling for Radius and Orbit
  const { moonRadius, orbitRadius } = useMemo(() => {
    // Diameter: Power scaling makes tiny moons visible
    const rKm = (satelliteData?.diameter ?? 1000) / 2;
    const mRadius = THREE.MathUtils.clamp(
      Math.pow(rKm, 0.5) * 1.5, 
      parentVisualRadius * 0.08, 
      parentVisualRadius * 0.4
    );

    // Orbit: Ensure it is far enough to clear planet, but not so far it hits next orbit
    const realOrbit = parentVisualRadius * ((satelliteData?.distanceFromParent ?? 100000) / earthRadiusKm);
    const surfaceGap = (parentVisualRadius * SIM_CONFIG.MOON_SURFACE_GAP) + mRadius;
    
    // CLAMP: Keep moons within a "Safety Bubble" (max 8x planet radius)
    const maxLimit = parentVisualRadius * 8; 
    return { moonRadius: mRadius, orbitRadius: THREE.MathUtils.clamp(realOrbit, surfaceGap, maxLimit) };
  }, [satelliteData, parentVisualRadius]);

  const inclinationRad = useMemo(() => 
    THREE.MathUtils.degToRad(satelliteData?.orbitalInclination ?? 0), 
  [satelliteData?.orbitalInclination]);

  // 3. Animation: Synchronized Global Speed
  useFrame((state, delta) => {
    if (!moonRef.current) return;

    const angularSpeed = (Math.PI * 2 / (satelliteData?.orbitalPeriod ?? 30)) * SIM_CONFIG.TIME_STEP;
    thetaRef.current += angularSpeed * delta;

    moonRef.current.position.set(
      Math.cos(thetaRef.current) * orbitRadius,
      0,
      Math.sin(thetaRef.current) * orbitRadius
    );

    // Tidal Locking: Faces planet center
    moonRef.current.rotation.y = -thetaRef.current + Math.PI / 2;
  });

  return { moonRef, moonRadius, inclinationRad, orbitRadius };
}