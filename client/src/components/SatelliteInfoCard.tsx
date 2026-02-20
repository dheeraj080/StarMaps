import React, { useMemo } from "react";
import { Html } from "@react-three/drei";

interface InfoCardProps {
  sat: any;
  onClose: () => void;
}

export function SatelliteInfoCard({ sat, onClose }: InfoCardProps) {
  if (!sat) return null;

  // Memoize orbit calculations so they don't re-run unless the satellite changes
  const orbitInfo = useMemo(() => {
    const id = parseInt(sat.id);
    if (isNaN(id)) return "UNKNOWN";
    // Geosynchronous orbits are generally above 35,000km,
    // but in satellite catalogs, high IDs often signify specific constellations.
    return id > 40000 ? "HEO/GEO" : "LEO/MEO";
  }, [sat.id]);

  return (
    <Html
      portal={{ current: document.body }}
      // Anchors the HTML to the top-left of the screen (0,0)
      calculatePosition={() => [0, 0]}
      style={{ pointerEvents: "none" }}
    >
      {/* The 'side-aligned' class in your CSS should handle the 'right: 30px' positioning */}
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

        {/* Animated scanning line for that high-tech feel */}
        <div className="hud-scanner-line" />
      </div>
    </Html>
  );
}
