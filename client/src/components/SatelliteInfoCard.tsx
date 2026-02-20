import { useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three"; // Added missing import

interface InfoCardProps {
  sat: any;
  onClose: () => void;
  position?: THREE.Vector3; // Prop is correctly defined here
}

// FIX: Added 'position' to the destructured arguments below
export function SatelliteInfoCard({
  sat,
  onClose,
  position: _position,
}: InfoCardProps) {
  if (!sat) return null;

  const orbitInfo = useMemo(() => {
    const id = parseInt(sat.id);
    if (isNaN(id)) return "UNKNOWN";
    return id > 40000 ? "HEO/GEO" : "LEO/MEO";
  }, [sat.id]);

  return (
    <Html
      portal={{ current: document.body }}
      calculatePosition={() => [0, 0]}
      style={{ pointerEvents: "none" }}
    >
      <div
        className="pro-hud-card side-aligned"
        style={{ pointerEvents: "auto" }}
      >
        <div className="hud-header">
          <div className="hud-glitch-effect" data-text="TARGET_LOCK">
            TARGET_LOCK
          </div>
          <span className="hud-status">SIGNAL_STRENGTH: 98%</span>
        </div>

        <div className="hud-body">
          <h2 className="hud-title">{sat.name || "NOC_IDENTITY_UNK"}</h2>

          <div className="hud-stats-grid">
            <div className="stat-row">
              <label>NORAD_ID</label>
              <span className="value-highlight">{sat.id}</span>
            </div>
            <div className="stat-row">
              <label>ORBIT_REGIME</label>
              <span>{orbitInfo}</span>
            </div>
            {/* Logic check: If position prop is used later for distance math, it's ready here */}
            <div className="stat-row">
              <label>EPOCH_REF</label>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="hud-footer">
          <button className="hud-abort-btn" onClick={onClose}>
            CLOSE
          </button>
        </div>

        <div className="hud-scanner-line" />
      </div>
    </Html>
  );
}
