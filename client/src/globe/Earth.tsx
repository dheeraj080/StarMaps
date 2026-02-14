import React, { useMemo, useEffect } from "react";
import { extend } from "@react-three/fiber";
import ThreeGlobe from "three-globe";
import * as THREE from "three";

extend({ ThreeGlobe });

interface EarthProps {
  radius: number;
}

export function Earth({ radius }: EarthProps) {
  const globe = useMemo(() => {
    // 1. Define 'g' properly
    const g = new ThreeGlobe()
      .globeImageUrl(
        "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
      )
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .showAtmosphere(true)
      .atmosphereColor("lightskyblue")
      .atmosphereAltitude(0.15);

    // 2. Disable Raycasting for the entire globe and its atmosphere
    // This allows the "laser" to pass through to the satellites
    g.raycast = () => null;

    // Safety: ensure all children are also unclickable
    g.traverse((obj) => {
      obj.raycast = () => null;
    });

    return g;
  }, []);

  useEffect(() => {
    const mat = globe.globeMaterial() as THREE.MeshPhongMaterial;
    mat.color = new THREE.Color(0xffffff);
    mat.emissive = new THREE.Color(0x000022);
    mat.emissiveIntensity = 0.1;
    mat.shininess = 0.9;
  }, [globe]);

  const scale = radius / 100;

  return (
    <group
      scale={[scale, scale, scale]}
      pointerEvents="none" // Tells R3F to ignore this entire group for raycasting
    >
      <primitive object={globe} />
    </group>
  );
}
