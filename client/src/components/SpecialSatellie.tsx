import { useGLTF, Float, Html } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

export function SpecialSatellite({
  position,
  name,
  url,
}: {
  position: THREE.Vector3;
  name: string;
  url: string;
}) {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <primitive object={clonedScene} scale={0.08}>
          {/* Apply a subtle glow material to all meshes in the model */}
          {clonedScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
                color: "#00f2ff",
                wireframe: true,
                transparent: true,
                opacity: 0.6,
                emissive: "#00f2ff",
                emissiveIntensity: 0.5,
              });
            }
          })}
        </primitive>
      </Float>

      {/* Permanent subtle label for Special Satellites */}
      <Html distanceFactor={10} style={{ pointerEvents: "none" }}>
        <div
          style={{
            color: "#00f2ff",
            fontSize: "10px",
            fontFamily: "monospace",
            borderLeft: "1px solid #00f2ff",
            paddingLeft: "5px",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
      </Html>
    </group>
  );
}
