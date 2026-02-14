import React, { useMemo, useEffect, useState, useRef } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import ThreeGlobe from "three-globe";
import * as THREE from "three";

// --- IMPORTS FOR DATA LAYERS ---
import { LaunchesLayer } from "../components/LaunchLayer";
import { SatelliteLayer } from "../components/SatelliteLayer";

// 1. Register ThreeGlobe
extend({ ThreeGlobe });

// --- CONSTANTS ---
const EARTH_RADIUS = 6.371;
const MOON_RADIUS = EARTH_RADIUS * 0.27;
const SUN_DISTANCE = 200;

// --- COMPONENT: Earth ---
function Earth() {
  const globe = useMemo(() => {
    return new ThreeGlobe()
      .globeImageUrl(
        "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
      )
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .showAtmosphere(true)
      .atmosphereColor("lightskyblue")
      .atmosphereAltitude(0.15);
  }, []);

  useEffect(() => {
    const mat = globe.globeMaterial() as THREE.MeshPhongMaterial;
    mat.color = new THREE.Color(0xffffff);
    mat.emissive = new THREE.Color(0x000022);
    mat.emissiveIntensity = 0.1;
    mat.shininess = 0.9;
  }, [globe]);

  const scale = EARTH_RADIUS / 100;

  return (
    <group scale={[scale, scale, scale]}>
      <primitive object={globe} />
    </group>
  );
}

// --- COMPONENT: Sun ---
function Sun() {
  return (
    <group position={[SUN_DISTANCE, 20, 50]}>
      <mesh>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial color="#FFDD00" />
      </mesh>
      <pointLight intensity={30000} decay={2} color="#ffffee" />
      <directionalLight
        intensity={2.0}
        position={[0, 0, 0]}
        target-position={[0, 0, 0]}
      />
    </group>
  );
}

// --- COMPONENT: Moon ---
function Moon() {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    new THREE.TextureLoader().load(
      "//unpkg.com/three-globe/example/img/moon.jpg",
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
      <sphereGeometry args={[MOON_RADIUS, 32, 32]} />
      <meshStandardMaterial
        map={tex}
        color={tex ? "white" : "#888888"}
        roughness={0.8}
      />
    </mesh>
  );
}

// --- MAIN SCENE ---
export function GlobeScene() {
  return (
    <Canvas
      camera={{
        position: [0, 0, 25],
        fov: 45,
        near: 0.1,
        far: 2000,
      }}
    >
      <color attach="background" args={["#000005"]} />

      {/* 1. Environment */}
      <Stars
        radius={300}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      <ambientLight intensity={0.1} color="#444444" />

      {/* 2. Celestial Bodies */}
      <Sun />
      <Earth />
      <Moon />

      {/* 3. Real-Time Data Layers (Connected to Backend) */}
      <SatelliteLayer />
      <LaunchesLayer radius={EARTH_RADIUS} />

      {/* 4. Controls */}
      <OrbitControls
        minDistance={8}
        maxDistance={150}
        enablePan={false}
        zoomSpeed={0.6}
      />
    </Canvas>
  );
}
