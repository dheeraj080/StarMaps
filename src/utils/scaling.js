import * as THREE from "three";


export const SCALING_CONFIG = {
  LOG_DISTANCE_SCALE: 900,     // visual spread
  AU_TO_KM: 149597870.7,
  TIME_SPEED: 1000,
};

export const getVisualVector = (posAu) => {
  const AU_TO_KM = SCALING_CONFIG.AU_TO_KM;
  const LOG_SCALE = 500;

  const x = posAu.x * AU_TO_KM;
  const y = posAu.y * AU_TO_KM;
  const z = posAu.z * AU_TO_KM;

  const r = Math.sqrt(x*x + y*y + z*z);
  if (r === 0) {
    return { direction: new THREE.Vector3(), radius: 0 };
  }

  const scaledRadius = Math.log10(r + 1) * LOG_SCALE;

  return {
    direction: new THREE.Vector3(x, y, z).normalize(),
    radius: scaledRadius,
  };
};


export const radiusScale = Math.pow(10, -1.8);
