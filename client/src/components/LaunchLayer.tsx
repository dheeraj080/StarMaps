import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { apiGet } from "../api/client";
import { latLonToUnitSphere } from "../globe/tiles/tileMath";

// --- Sub-component for the T-Minus Timer ---
function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        setTimeLeft("LIFT OFF / IN FLIGHT");
        return;
      }

      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`T- ${d}d ${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div
      style={{
        color: "#ffcc00",
        fontWeight: "bold",
        fontSize: "12px",
        marginTop: "8px",
        letterSpacing: "1px",
      }}
    >
      {timeLeft}
    </div>
  );
}

export function LaunchesLayer({ radius }: { radius: number }) {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null);

  useEffect(() => {
    apiGet<Resp>("/api/launches/upcoming")
      .then((d) => {
        if (d && d.results) setLaunches(d.results);
      })
      .catch((e) => console.error("Launches fetch failed.", e));
  }, []);

  return (
    <group>
      {launches
        .filter((l) => Number.isFinite(l.pad_lat) && Number.isFinite(l.pad_lon))
        .map((l) => {
          const p = latLonToUnitSphere(l.pad_lat, l.pad_lon);
          const r = radius * 1.01;
          const position: [number, number, number] = [
            p.x * r,
            p.y * r,
            p.z * r,
          ];

          return (
            <group key={l.id} position={position}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLaunch(l);
                }}
                onPointerOver={() => (document.body.style.cursor = "pointer")}
                onPointerOut={() => (document.body.style.cursor = "auto")}
              >
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshBasicMaterial color="orange" toneMapped={false} />
              </mesh>

              {selectedLaunch?.id === l.id && (
                <Html center distanceFactor={15}>
                  <div
                    style={{
                      background: "rgba(10, 5, 0, 0.95)",
                      color: "orange",
                      padding: "15px",
                      borderRadius: "2px",
                      borderLeft: "4px solid orange",
                      width: "240px",
                      fontFamily: "monospace",
                      boxShadow: "0 0 20px rgba(0,0,0,0.5)",
                      pointerEvents: "auto",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "10px", opacity: 0.7 }}>
                        MISSION DATA
                      </span>
                      <button
                        onClick={() => setSelectedLaunch(null)}
                        style={{
                          color: "red",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    <div style={{ fontSize: "15px", margin: "10px 0" }}>
                      {l.name}
                    </div>

                    {/* The Countdown Component */}
                    <Countdown targetDate={l.net_utc} />

                    <div
                      style={{
                        fontSize: "10px",
                        marginTop: "10px",
                        opacity: 0.6,
                      }}
                    >
                      EST. LIFT OFF: {new Date(l.net_utc).toUTCString()}
                    </div>
                  </div>
                </Html>
              )}
            </group>
          );
        })}
    </group>
  );
}
