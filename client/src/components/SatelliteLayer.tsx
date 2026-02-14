import React, { useEffect, useRef, useMemo, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import * as satellite from "satellite.js";

type SatelliteRecord = {
  id: number;
  name: string;
  line1: string;
  line2: string;
};

const EARTH_RADIUS_KM = 6371;
const GAME_UNITS = 6.371;
const SCALE = GAME_UNITS / EARTH_RADIUS_KM;

// We define these outside the component to avoid re-creation
const _obj = new THREE.Object3D();
const _matrix = new THREE.Matrix4();

export function SatelliteLayer() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const [data, setData] = useState<SatelliteRecord[]>([]);
  const [selectedSat, setSelectedSat] = useState<SatelliteRecord | null>(null);
  const [cardPos, setCardPos] = useState<THREE.Vector3 | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/satellites/?limit=5000")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to fetch sats:", err));
  }, []);

  const satRecs = useMemo(() => {
    return data.map((rec) => ({
      satrec: satellite.twoline2satrec(rec.line1, rec.line2),
      ...rec,
    }));
  }, [data]);

  // FIX 1: Set a static, massive bounding sphere immediately
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.8, 4, 4); // Use a sphere hitbox
    geo.computeBoundingSphere();
    if (geo.boundingSphere) geo.boundingSphere.radius = 100;
    return geo;
  }, []);

  const handlePointerDown = (e: ThreeEvent<MouseEvent>) => {
    // FIX 2: Check instanceId explicitly
    if (e.instanceId !== undefined) {
      e.stopPropagation();
      const sat = satRecs[e.instanceId];
      setSelectedSat(sat);

      // Get the current position for the Info Card
      meshRef.current.getMatrixAt(e.instanceId, _matrix);
      const pos = new THREE.Vector3().setFromMatrixPosition(_matrix);
      setCardPos(pos);
      console.log("Satellite Selected:", sat.name);
    }
  };

  useFrame(() => {
    if (!meshRef.current || satRecs.length === 0) return;

    const now = new Date();
    const gmst = satellite.gstime(now);

    satRecs.forEach((sat, i) => {
      const posVel = satellite.propagate(sat.satrec, now);
      if (posVel.position && typeof posVel.position !== "boolean") {
        const posGd = satellite.eciToEcf(posVel.position, gmst);

        // FIX 3: Ensure matrix is updated exactly where the raycaster expects
        _obj.position.set(posGd.x * SCALE, posGd.z * SCALE, -posGd.y * SCALE);
        _obj.scale.set(0.12, 0.12, 0.12); // Larger click target
        _obj.updateMatrix();
        meshRef.current.setMatrixAt(i, _obj.matrix);

        if (selectedSat?.id === sat.id) {
          setCardPos(_obj.position.clone());
        }
      }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[geometry, undefined, satRecs.length]}
        onClick={handlePointerDown}
        frustumCulled={false}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
      >
        <meshBasicMaterial color="#00f2ff" />
      </instancedMesh>

      {selectedSat && cardPos && (
        <Html position={cardPos} distanceFactor={10}>
          <div className="sat-card">
            <div className="card-header">NORAD TRACKING // ACTIVE</div>
            <h3>{selectedSat.name}</h3>
            <button onClick={() => setSelectedSat(null)}>CLOSE</button>
          </div>
        </Html>
      )}
    </group>
  );
}
