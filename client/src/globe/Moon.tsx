import React, { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MoonProps {
  radius: number;
}

export function Moon({ radius }: MoonProps) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Inside Moon.tsx
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      "https://unpkg.com/three-globe/example/img/moon.jpg", // Use HTTPS directly
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        setTex(t);
      },
    );
  }, []);

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.001;
  });

  return (
    <mesh ref={meshRef} position={[-50, 10, -50]}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        map={tex}
        color={tex ? "white" : "#888888"}
        roughness={0.8}
      />
    </mesh>
  );
}
