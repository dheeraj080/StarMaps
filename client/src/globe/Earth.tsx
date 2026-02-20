import { useMemo, useEffect } from "react";
import { extend } from "@react-three/fiber";
import ThreeGlobe from "three-globe";
import * as THREE from "three";

extend({ ThreeGlobe });

interface EarthProps {
  radius: number;
}

export function Earth({ radius }: EarthProps) {
  const globe = useMemo(() => {
    const g = new ThreeGlobe()
      .globeImageUrl(
        "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
      )
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .showAtmosphere(true)
      .atmosphereColor("lightskyblue")
      .atmosphereAltitude(0.15);

    // Disable raycasting for globe + atmosphere so satellites are clickable
    (g as any).raycast = () => null;
    g.traverse((obj: any) => {
      obj.raycast = () => null;
    });

    return g;
  }, []);

  useEffect(() => {
    const mat = globe.globeMaterial() as THREE.MeshPhongMaterial;
    mat.color = new THREE.Color(0xffffff);
    mat.emissive = new THREE.Color(0x000022);
    mat.emissiveIntensity = 0.1;
    mat.shininess = 0.9;
  }, [globe]);

  const scale = radius / 100;

  return (
    <group scale={[scale, scale, scale]}>
      <primitive object={globe} />
    </group>
  );
}
