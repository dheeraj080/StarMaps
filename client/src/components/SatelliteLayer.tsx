import React, { useEffect, useRef, useMemo, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import * as satellite from "satellite.js";

import { SatelliteSearch } from "./SatelliteSearch";
import { SatelliteInfoCard } from "./SatelliteInfoCard";

// Constants
const EARTH_RADIUS_KM = 6371;
const GAME_UNITS = 6.371;
const SCALE = GAME_UNITS / EARTH_RADIUS_KM;

// Optimized Temp Objects
const _obj = new THREE.Object3D();
const _color = new THREE.Color();

export function SatelliteLayer() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const { controls } = useThree();

  const [data, setData] = useState<any[]>([]);
  const [selectedSat, setSelectedSat] = useState<any | null>(null);
  const [cardPos, setCardPos] = useState<THREE.Vector3 | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch
  useEffect(() => {
    fetch("http://localhost:8000/api/satellites/?limit=5000")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // 2. Memoized Geometry & TLE Data
  const { geometry, satRecs } = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 6, 6);
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 100);

    const recs = data.map((rec) => ({
      ...rec,
      satrec: satellite.twoline2satrec(rec.line1, rec.line2),
    }));

    return { geometry: geo, satRecs: recs };
  }, [data]);

  // 3. Search Filtering
  const searchResults = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return data
      .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 8);
  }, [searchTerm, data]);

  // 4. Update Loop
  useFrame(() => {
    if (!meshRef.current || satRecs.length === 0) return;
    const now = new Date();
    const gmst = satellite.gstime(now);

    satRecs.forEach((sat, i) => {
      const posVel = satellite.propagate(sat.satrec, now);
      if (posVel.position && typeof posVel.position !== "boolean") {
        const posGd = satellite.eciToEcf(posVel.position, gmst);
        const isSelected = selectedSat?.id === sat.id;

        _obj.position.set(posGd.x * SCALE, posGd.z * SCALE, -posGd.y * SCALE);
        const s = isSelected ? 0.25 : 0.12;
        _obj.scale.set(s, s, s);
        _obj.updateMatrix();
        meshRef.current.setMatrixAt(i, _obj.matrix);

        _color.set(isSelected ? "#ffffff" : "#00f2ff");
        meshRef.current.setColorAt(i, _color);

        if (isSelected) {
          const currentPos = _obj.position.clone();
          setCardPos(currentPos);
          // @ts-ignore - Smoothly track the satellite
          if (controls) controls.target.lerp(currentPos, 0.1);
        }
      }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true;
  });

  if (satRecs.length === 0) return null;

  return (
    <group>
      {/* 1. The HUD Search Bar */}
      <Html
        // 1. This moves the HTML out of the Canvas and into the <body>
        portal={{ current: document.body }}
        // 2. This ensures the container doesn't move with the camera
        calculatePosition={() => [0, 0]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none", // Critical: allows clicking the globe
        }}
      >
        <SatelliteSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          results={searchResults}
          onSelect={(sat) => {
            setSelectedSat(sat);
            setSearchTerm("");
          }}
        />
      </Html>

      {/* 2. The Satellites */}
      <instancedMesh
        key={satRecs.length}
        ref={meshRef}
        args={[geometry, undefined, satRecs.length]}
        frustumCulled={false}
        onClick={(e) => {
          e.stopPropagation();
          if (e.instanceId !== undefined) setSelectedSat(satRecs[e.instanceId]);
        }}
        onPointerEnter={() => (document.body.style.cursor = "pointer")}
        onPointerLeave={() => (document.body.style.cursor = "auto")}
      >
        <meshBasicMaterial transparent opacity={0.9} />
      </instancedMesh>

      {/* 3. The Follow-Label Info Card */}
      {selectedSat && cardPos && (
        <SatelliteInfoCard
          sat={selectedSat}
          position={cardPos}
          onClose={() => setSelectedSat(null)}
        />
      )}
    </group>
  );
}
