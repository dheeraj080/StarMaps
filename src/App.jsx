import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import solarData from "./data/solarsystem.json";
import Camera from "./components/Camera";
import Sun from "./components/Sun";
import Planet from "./components/Planets";
import SolarControls from "./components/SolarControls";
import {
  EffectComposer,
  Bloom,
  ToneMapping,
} from "@react-three/postprocessing";

// A simple loading component so the screen isn't just black
function Loader() {
  return (
    <Html center>
      <div
        style={{ color: "white", fontSize: "2em", fontFamily: "sans-serif" }}
      >
        Loading Universe...
      </div>
    </Html>
  );
}

export default function App() {
  const [targetDate, setTargetDate] = useState(new Date());
  const [timeSpeed, setTimeSpeed] = useState(1000);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <SolarControls
        onDateChange={setTargetDate}
        onSpeedChange={setTimeSpeed}
        currentSpeed={timeSpeed}
      />

      <Canvas camera={{ position: [0, 20000, 20000], near: 10, far: 2000000 }}>
        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.9} // Only objects with high emissive/brightness will glow
            mipmapBlur
          />
          <ToneMapping exposure={1.2} />
        </EffectComposer>
        {/* The Suspense boundary is CRITICAL here. 
            Everything inside will stay hidden until ALL textures are loaded.
        */}
        <Suspense fallback={null}>
          <Camera />

          <Sun data={solarData.parent} />
          <pointLight
            position={[0, 0, 0]}
            intensity={2.5}
            decay={0}
            castShadow
          />
          <ambientLight intensity={0.1} />
          {solarData.planets.map((p, i) => (
            <Planet
              key={p.id}
              data={{ ...p, index: i }}
              baseDate={targetDate}
              speed={timeSpeed}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}
