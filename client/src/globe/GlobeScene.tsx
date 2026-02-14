import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Bounds } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ToneMapping,
} from "@react-three/postprocessing";

// Celestial Components
import { Earth } from "./Earth";
import { Sun } from "./Sun";
import { Moon } from "./Moon";

// Data Layer Components
import { LaunchesLayer } from "../components/LaunchLayer";
import { SatelliteLayer } from "../components/SatelliteLayer";

// Constants
const EARTH_RADIUS = 6.371;
const MOON_RADIUS = EARTH_RADIUS * 0.27;
const SUN_DISTANCE = 200;

// ... (imports remain the same)

export function GlobeScene() {
  function DebugSatellite() {
    return (
      <mesh
        position={[0, 10, 0]}
        onClick={() => alert("Debug Sat Clicked!")}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="red" />
      </mesh>
    );
  }

  return (
    <Canvas
      flat
      camera={{ position: [0, 0, 25], fov: 45 }}
      // Increased threshold makes it easier to click small satellites
      raycaster={{
        params: { Mesh: { threshold: 0.5 } },
        sortObjects: true,
      }}
    >
      <color attach="background" args={["#000005"]} />

      <Stars radius={300} count={5000} fade />
      <ambientLight intensity={0.4} />
      <Sun distance={SUN_DISTANCE} />

      <Earth radius={EARTH_RADIUS} />
      <Moon radius={MOON_RADIUS} />

      {/* Keep satellites outside Bounds to avoid raycast occlusion */}
      <SatelliteLayer />

      <Bounds fit clip observe margin={1.2}>
        <LaunchesLayer radius={EARTH_RADIUS} />
      </Bounds>

      <EffectComposer disableNormalPass>
        <Bloom
          luminanceThreshold={0.2}
          mipmapBlur
          intensity={1.5}
          radius={0.4}
        />
        <ToneMapping />
      </EffectComposer>

      <OrbitControls
        makeDefault
        minDistance={8}
        maxDistance={150}
        enablePan={false}
      />
      <DebugSatellite />
    </Canvas>
  );
}
