// utils/scaling.js
export const SCALING_CONFIG = {
  // Linear position factor from sanderblue
  LINEAR_FACTOR: Math.pow(10, -5), 
  
  // OBSERVABLE OVERRIDE: 
  // We blow up planet sizes significantly so they are visible 
  // against the massive void of linear space.
  PLANET_SIZE_MULTIPLIER: 800, 
  SUN_SIZE_MULTIPLIER: 15, // Sun is already huge, so it needs less help

  TIME_SPEED: 1000, 
  AU_TO_KM: 149597870.7,
};

export const getVisualRadius = Math.pow(10, -2)

export const getVisualPosition = (posAu) => {
  const { LINEAR_FACTOR, AU_TO_KM } = SCALING_CONFIG;
  return [
    posAu.x * AU_TO_KM * LINEAR_FACTOR,
    posAu.y * AU_TO_KM * LINEAR_FACTOR,
    posAu.z * AU_TO_KM * LINEAR_FACTOR,
  ];
};
