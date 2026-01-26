import * as THREE from "three";

/**
 * Build orbit ring points from classical orbital elements.
 *
 * Units:
 * - a: any length unit (km, AU, "scene units") — just be consistent.
 * - angles: radians
 */
export function buildOrbitPoints({
  a,
  e,
  i,
  Omega,
  omega,
  segments = 256,
  yOffset = 0,
}) {
  const pts = [];
  const p = a * (1 - e * e); // semi-latus rectum

  // Precompute rotation matrix: Rz(Omega) * Rx(i) * Rz(omega)
  const rot = new THREE.Matrix4()
    .makeRotationZ(Omega)
    .multiply(new THREE.Matrix4().makeRotationX(i))
    .multiply(new THREE.Matrix4().makeRotationZ(omega));

  for (let s = 0; s <= segments; s++) {
    const nu = (s / segments) * Math.PI * 2; // true anomaly
    const r = p / (1 + e * Math.cos(nu));

    // Perifocal coordinates (orbit plane)
    const x = r * Math.cos(nu);
    const y = r * Math.sin(nu);
    const z = 0;

    const v = new THREE.Vector3(x, y, z).applyMatrix4(rot);
    v.y += yOffset; // tiny lift to avoid z-fighting if you want

    pts.push(v);
  }

  return pts;
}
