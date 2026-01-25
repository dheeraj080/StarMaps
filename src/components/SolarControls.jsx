import React from "react";
import { ASTRONOMICAL_EVENTS } from "../utils/events";

export default function SolarControls({
  onDateChange,
  onSpeedChange,
  currentSpeed,
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        zIndex: 100,
        background: "rgba(0, 0, 0, 0.7)",
        padding: "20px",
        borderRadius: "8px",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <h3>Astronomical Events</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          marginBottom: "20px",
        }}
      >
        {ASTRONOMICAL_EVENTS.map((event) => (
          <button
            key={event.name}
            onClick={() => onDateChange(event.date)}
            style={{
              padding: "8px",
              cursor: "pointer",
              background: "#333",
              color: "white",
              border: "1px solid #555",
              textAlign: "left",
            }}
          >
            {event.name}
          </button>
        ))}
      </div>

      <h3>Simulation Speed</h3>
      <input
        type="range"
        min="1"
        max="100000"
        value={currentSpeed}
        onChange={(e) => onSpeedChange(Number(e.target.value))}
        style={{ width: "100%" }}
      />
      <div>Speed: {currentSpeed}x</div>
    </div>
  );
}
