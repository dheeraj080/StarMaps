import { useRef, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as Astronomy from "astronomy-engine";
import * as THREE from "three";
import { easing } from "maath";
import { SCALING_CONFIG } from "../utils/scaling";

export function usePlanetLogic(data) {
  const groupRef = useRef();
  const { controls } = useThree();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 1. Texture Loading
  const texture = useTexture(data._3d?.textures?.base || "/textures/default_planet.jpg");

  // 2. Visual Size
  const visualRadius = useMemo(() => {
    return Math.pow(data.diameter, 0.41) * 25;
  }, [data.diameter]);

  // 3. Axial Tilt calculation
  const axialTiltRad = useMemo(() => {
    return (data.axialTilt || 0) * (Math.PI / 180);
  }, [data.axialTilt]);

  // 4. Position & Rotation Loop
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // A. Calculate Current Simulation Time
    const date = new Date(
      Date.now() + state.clock.elapsedTime * 1000 * SCALING_CONFIG.TIME_SPEED
    );

    // B. Get Heliocentric Elliptical Coordinates (AU)
    const posAu = Astronomy.HelioVector(data.name, date);
    
    // C. LOGARITHMIC SCALING LOGIC
    // 1. Calculate raw distance from the sun in AU
    const rawDistance = Math.sqrt(posAu.x ** 2 + posAu.y ** 2 + posAu.z ** 2);
    
    // 2. Apply log function to squash outer distances while stretching inner ones
    // Adjust 25000 to move all planets further or closer as a group
    const logScale = SCALING_CONFIG.DISTANCE_SCALE || 25000;
    const visualDistance = Math.log10(rawDistance + 1) * logScale;

    // 3. Normalize the raw vector and re-scale it to the logarithmic distance
    // Note: Swap Y and Z here to match Three.js (Y-up) coordinate system
    const direction = new THREE.Vector3(posAu.x, posAu.z, posAu.y).normalize();
    groupRef.current.position.copy(direction.multiplyScalar(visualDistance));

    // D. Spin the Planet Mesh (Internal Rotation)
    const planetMesh = groupRef.current.getObjectByName("planet-mesh");
    if (planetMesh) {
      const dayFactor = 24 / (data.rotationPeriod || 24);
      planetMesh.rotation.y += delta * 0.5 * dayFactor;
    }

    // E. Camera Transition Logic
    if (isTransitioning && controls) {
      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);
      easing.damp3(controls.target, worldPos, 0.3, delta);
      const offset = new THREE.Vector3(0, visualRadius * 2, visualRadius * 6);
      const idealPos = worldPos.clone().add(offset);
      easing.damp3(state.camera.position, idealPos, 0.3, delta);
      if (state.camera.position.distanceTo(idealPos) < 1) setIsTransitioning(false);
    }
  });

  const handlePlanetClick = (e) => {
    e.stopPropagation();
    setIsTransitioning(true);
  };

  return {
    groupRef,
    visualRadius,
    texture,
    axialTiltRad,
    handlePlanetClick,
  };
}