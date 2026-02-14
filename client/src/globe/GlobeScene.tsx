import React, { useMemo, useEffect, useState, useRef } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import ThreeGlobe from "three-globe";
import * as THREE from "three";

// 1. Register ThreeGlobe
extend({ ThreeGlobe });

// --- CONSTANTS ---
const EARTH_RADIUS = 6.371; // In your units
const MOON_RADIUS = EARTH_RADIUS * 0.27;
const SUN_DISTANCE = 200; // Fake distance for visual scale (real is too far)

// --- HELPER: Create an elliptical orbit path ---
function createOrbitPath(
  altitude: number,
  inclination: number,
  segments = 128,
) {
  const points: THREE.Vector3[] = [];
  const r = EARTH_RADIUS + altitude;

  // Create a circle on the XZ plane
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    points.push(new THREE.Vector3(x, 0, z));
  }

  // Rotate it to match inclination
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  geometry.rotateZ(inclination * (Math.PI / 180)); // Tilt the orbit
  return geometry;
}

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

  // Scale: Default 100 -> Target 6.371
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
      {/* 1. Visual Sun Sphere */}
      <mesh>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial color="#FFDD00" />
      </mesh>

      {/* 2. The Actual Light Source */}
      <pointLight intensity={30000} decay={2} color="#ffffee" />

      {/* 3. Global Directional Light (Simulates parallel sun rays) */}
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

  // Slow rotation for the moon
  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.001;
  });

  return (
    <mesh
      ref={meshRef}
      position={[-50, 10, -50]} // Fixed position in background
    >
      <sphereGeometry args={[MOON_RADIUS, 32, 32]} />
      <meshStandardMaterial
        map={tex}
        color={tex ? "white" : "#888888"}
        roughness={0.8}
      />
    </mesh>
  );
}

// --- COMPONENT: Satellite Orbit ---
function Orbit({ altitude, inclination, color, speed, label }: any) {
  const geom = useMemo(
    () => createOrbitPath(altitude, inclination),
    [altitude, inclination],
  );
  const satRef = useRef<THREE.Mesh>(null);

  // Animate a small satellite along the path
  useFrame(({ clock }) => {
    if (satRef.current) {
      const t = clock.getElapsedTime() * speed;
      const r = EARTH_RADIUS + altitude;
      // Simple circular motion logic aligned with orbit
      const x = r * Math.cos(t);
      const z = r * Math.sin(t);

      // We apply the same rotation as the orbit geometry
      const pos = new THREE.Vector3(x, 0, z);
      pos.applyAxisAngle(
        new THREE.Vector3(0, 0, 1),
        inclination * (Math.PI / 180),
      );

      satRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      {/* The Orbit Line */}
      <line geometry={geom}>
        <lineBasicMaterial color={color} transparent opacity={0.5} />
      </line>

      {/* The Satellite Marker */}
      <mesh ref={satRef}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
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
      <ambientLight intensity={0.1} color="#444444" />{" "}
      {/* Dark shadows for space look */}
      <Sun />
      {/* 2. Celestial Bodies */}
      <Earth />
      <Moon />
      {/* 3. Orbits */}
      {/* ISS: Low Earth Orbit (~400km -> 0.4 units), 51.6 degree inclination */}
      <Orbit
        altitude={0.4}
        inclination={51.6}
        color="cyan"
        speed={0.8}
        label="ISS"
      />
      {/* Hubble: Slightly higher (~540km -> 0.54 units), 28.5 degree inclination */}
      <Orbit
        altitude={0.54}
        inclination={28.5}
        color="orange"
        speed={0.7}
        label="HST"
      />
      {/* Polar Satellite: 90 degree inclination */}
      <Orbit
        altitude={0.8}
        inclination={90}
        color="magenta"
        speed={0.6}
        label="Polar"
      />
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
