import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function useMoonLogic(satelliteData, parentVisualRadius) {
  const moonRef = useRef(null);
  
  // 1. Physical Constants
  const { diameterKm, distanceKm, periodDays, inclDeg } = useMemo(() => ({
    diameterKm: satelliteData?.diameter ?? 1000,
    distanceKm: satelliteData?.distanceFromParent ?? 100000,
    periodDays: satelliteData?.orbitalPeriod ?? 30,
    inclDeg: satelliteData?.orbitalInclination ?? 0,
  }), [satelliteData]);

  const earthRadiusKm = 6378;

  // 2. Initial Start Position (Seed based on name so they don't line up)
  const startPhase = useMemo(() => {
    const seed = satelliteData?.name || "moon";
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0; 
    }
    return (Math.abs(hash) % 360) * (Math.PI / 180);
  }, [satelliteData?.name]);

  const thetaRef = useRef(startPhase);

  // 3. Visual Size & Orbit Radius
  const moonRadius = useMemo(() => {
    const rKm = diameterKm / 2;
    const ratioToEarthRadius = rKm / earthRadiusKm;
    const r = parentVisualRadius * ratioToEarthRadius;
    return THREE.MathUtils.clamp(r, parentVisualRadius * 0.06, parentVisualRadius * 0.4);
  }, [diameterKm, parentVisualRadius]);

  const orbitRadius = useMemo(() => {
  // 1. Calculate the "Real" distance scaled down
  const distanceInEarthRadii = distanceKm / earthRadiusKm;
  let r = parentVisualRadius * distanceInEarthRadii;
  
  // 2. Calculate the "Minimum Safe Distance"
  // This is the Planet's Visual Radius + Moon's Visual Radius + a clear gap
  const surfaceGap = parentVisualRadius + moonRadius + (parentVisualRadius * 0.5); 

  // 3. LOGARITHMIC BOOST (The Magic Fix)
  // If the moon is very close (like Phobos or Io), 
  // the real ratio will be too small. We use Math.max to force it out.
  return Math.max(r, surfaceGap);
}, [distanceKm, parentVisualRadius, moonRadius]);

  const inclinationRad = useMemo(() => THREE.MathUtils.degToRad(inclDeg), [inclDeg]);

  // 4. Animation Loop
  useFrame((state, delta) => {
    if (!moonRef.current) return;

    // Use a global time scale if available, otherwise 15
    const timeScale = state.timeScale || 15; 
    const angularSpeed = (Math.PI * 2 * timeScale) / periodDays;
    
    thetaRef.current += angularSpeed * delta;

    // Position on the X-Z plane (The parent group in JSX will handle the tilt)
    moonRef.current.position.set(
      Math.cos(thetaRef.current) * orbitRadius,
      0,
      Math.sin(thetaRef.current) * orbitRadius
    );

    // Tidal Locking: Look back at the planet
    // We adjust by PI/2 because Three.js textures usually face the +Z axis
    moonRef.current.rotation.y = -thetaRef.current + Math.PI / 2;
  });

  return { moonRef, moonRadius, inclinationRad, orbitRadius };
}