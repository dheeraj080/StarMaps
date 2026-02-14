import React from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface InfoCardProps {
  sat: any;
  position: THREE.Vector3;
  onClose: () => void;
}

export function SatelliteInfoCard({ sat, position, onClose }: InfoCardProps) {
  return (
    <Html position={position} distanceFactor={10}>
      <div className="sat-card" style={{ padding: "10px", minWidth: "150px" }}>
        <div style={{ fontSize: "9px", color: "#00f2ff", opacity: 0.8 }}>
          TRACKING_ACTIVE
        </div>
        <h4 style={{ margin: "4px 0", fontSize: "13px", color: "#fff" }}>
          {sat.name}
        </h4>
        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>
          ALT: {(position.length() * 1000).toFixed(0)} KM
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: "8px",
            background: "transparent",
            border: "none",
            color: "#ff4444",
            fontSize: "9px",
            cursor: "pointer",
            padding: 0,
          }}
        >
          [ DISCONNECT ]
        </button>
      </div>
    </Html>
  );
}
