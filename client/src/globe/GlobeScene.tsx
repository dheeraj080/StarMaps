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

export function GlobeScene() {
  return (
    <Canvas
      flat
      // Move sortObjects to the renderer (gl) if you need it,
      // otherwise, R3F handles standard sorting by default.
      gl={{ sortObjects: true }}
      camera={{
        position: [0, 0, 25],
        fov: 45,
        near: 0.1,
        far: 1000,
      }}
      raycaster={{
        // Some versions of three/r3f have stricter RaycasterParameters typing.
        // Casting keeps it compatible.
        params: { Mesh: { threshold: 0.5 } } as any,
      }}
    >
      <color attach="background" args={["#000005"]} />

      <Stars radius={300} count={5000} fade />
      <ambientLight intensity={0.4} />
      <Sun distance={SUN_DISTANCE} />

      <Earth radius={EARTH_RADIUS} />
      <Moon radius={MOON_RADIUS} />

      <SatelliteLayer />

      <Bounds fit clip observe margin={1.2}>
        <LaunchesLayer radius={EARTH_RADIUS} />
      </Bounds>

      {/* prop name differs across versions; this works with newer typings */}
      <EffectComposer enableNormalPass={false}>
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
    </Canvas>
  );
}
