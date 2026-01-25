import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import solarData from "./data/solarsystem.json";
import SolarCamera from "./components/Camera";
import Sun from "./components/Sun";
import Planet from "./components/Planets";
import SolarControls from "./components/SolarControls";

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

      <Canvas camera={{ position: [0, 5000, 15000], near: 10, far: 2000000 }}>
        {/* The Suspense boundary is CRITICAL here. 
            Everything inside will stay hidden until ALL textures are loaded.
        */}
        <Suspense fallback={null}>
          <SolarCamera />

          <Sun data={solarData.parent} />

          {solarData.planets.map((p) => (
            <Planet
              key={p.id}
              data={p}
              baseDate={targetDate}
              speed={timeSpeed}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}
