import React from "react";

export default function Sun({ data }) {
  const radius = data.diameter * Math.pow(10, -3.8);

  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshBasicMaterial color="#FFCC00" />
    </mesh>
  );
}
