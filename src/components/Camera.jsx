import React, { useMemo } from "react";
import { OrbitControls, Stars, PerspectiveCamera } from "@react-three/drei";

export default function CameraRig() {
  const starsProps = useMemo(
    () => ({
      radius: 500000,
      depth: 100000,
      count: 30000,
      factor: 10,
      saturation: 0,
      fade: true,
    }),
    [],
  );

  return (
    <>
      {/* Camera: set near/far for large scenes */}
      <PerspectiveCamera
        makeDefault
        fov={50}
        near={0.1}
        far={3_000_000}
        position={[0, 2000, 6000]}
      />

      {/* Controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.6}
        zoomToCursor
        screenSpacePanning
        minDistance={100}
        maxDistance={1_500_000}
        minPolarAngle={0.05}
        maxPolarAngle={Math.PI - 0.05}
      />

      {/* Starfield */}
      <Stars {...starsProps} />

      {/* Ambient fill */}
      <ambientLight intensity={0.02} />

      {/* “Sun” light at center */}
      <pointLight
        position={[0, 0, 0]}
        intensity={18}
        decay={2}
        distance={0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
    </>
  );
}
