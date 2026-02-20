import { useEffect, useRef, useMemo, useState } from "react"; // Removed 'React'
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import * as satellite from "satellite.js";
import { OrbitControls } from "three-stdlib";

import { SatelliteSearch } from "./SatelliteSearch";
import { SatelliteInfoCard } from "./SatelliteInfoCard";
import { OrbitPath } from "./OrbitPath";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

const EARTH_RADIUS_KM = 6371;
const GAME_UNITS = 6.371;
const SCALE = GAME_UNITS / EARTH_RADIUS_KM;

const _obj = new THREE.Object3D();
const _color = new THREE.Color();
const _sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 100);

export function SatelliteLayer() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const groundTrackRef = useRef<THREE.Mesh>(null!);
  const { controls, camera } = useThree();

  const [data, setData] = useState<any[]>([]);
  const [selectedSat, setSelectedSat] = useState<any | null>(null);
  const [cardPos, setCardPos] = useState<THREE.Vector3 | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadSatellites = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/satellites/?limit=5000`);
        if (!res.ok) throw new Error("Backend unavailable");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.warn("Server not available. Running in static mode.");
        setData([]);
      }
    };
    loadSatellites();
  }, []);

  const { geometry, satRecs } = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 6, 6);
    geo.boundingSphere = _sphere.clone();
    const recs = data.map((rec) => ({
      ...rec,
      satrec: satellite.twoline2satrec(rec.line1, rec.line2),
    }));
    return { geometry: geo, satRecs: recs };
  }, [data]);

  const searchResults = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return data
      .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 8);
  }, [searchTerm, data]);

  useFrame(() => {
    if (!meshRef.current || satRecs.length === 0) return;

    const now = new Date();
    const gmst = satellite.gstime(now);

    satRecs.forEach((sat, i) => {
      const posVel = satellite.propagate(sat.satrec, now);

      // FIX: Improved Null/Boolean check for TypeScript
      if (posVel && typeof posVel !== "boolean" && posVel.position) {
        const posGd = satellite.eciToEcf(posVel.position, gmst);
        const isSelected = selectedSat?.id === sat.id;

        _obj.position.set(posGd.x * SCALE, posGd.z * SCALE, -posGd.y * SCALE);
        const s = 0.12;
        _obj.scale.set(s, s, s);
        _obj.updateMatrix();
        meshRef.current.setMatrixAt(i, _obj.matrix);

        _color.set(isSelected ? "#ffffff" : "#00f2ff");
        meshRef.current.setColorAt(i, _color);

        if (isSelected) {
          const satPos = _obj.position.clone();
          if (satPos.length() > 1) {
            setCardPos(satPos);

            if (controls) {
              // FIX: Cast controls to OrbitControls to access .target
              const orbControls = controls as unknown as OrbitControls;
              orbControls.target.lerp(satPos, 0.1);

              const idealCamPos = satPos
                .clone()
                .normalize()
                .multiplyScalar(satPos.length() + 3);
              camera.position.lerp(idealCamPos, 0.05);
              orbControls.update();
            }
          }
        }
      }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true;
    meshRef.current.computeBoundingSphere();
  });

  if (satRecs.length === 0) return null;

  return (
    <group>
      <Html
        portal={{ current: document.body }}
        calculatePosition={() => [0, 0]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
        }}
      >
        <div className="hud-sidebar-right" style={{ pointerEvents: "auto" }}>
          <SatelliteSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            results={searchResults}
            onSelect={(sat) => {
              setSelectedSat(sat);
              setSearchTerm("");
            }}
          />
        </div>
      </Html>

      <instancedMesh
        key={satRecs.length}
        ref={meshRef}
        args={[geometry, undefined, satRecs.length]}
        frustumCulled={false}
        onClick={(e) => {
          e.stopPropagation();
          if (e.instanceId !== undefined) setSelectedSat(satRecs[e.instanceId]);
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <meshBasicMaterial transparent opacity={0.3} />
      </instancedMesh>

      {selectedSat && (
        <mesh ref={groundTrackRef}>
          <ringGeometry args={[0.08, 0.1, 32]} />
          <meshBasicMaterial color="#00f2ff" transparent opacity={0.6} />
        </mesh>
      )}

      {selectedSat && <OrbitPath satrec={selectedSat.satrec} scale={SCALE} />}

      {/* Note: Ensure SatelliteInfoCard interface includes 'position?: THREE.Vector3' */}
      {selectedSat && cardPos && (
        <SatelliteInfoCard
          sat={selectedSat}
          position={cardPos}
          onClose={() => {
            setSelectedSat(null);
            if (controls)
              (controls as unknown as OrbitControls).target.set(0, 0, 0);
          }}
        />
      )}
    </group>
  );
}
