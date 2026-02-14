// Physical constants
export const EARTH_RADIUS_KM = 6371;
export const MOON_RADIUS_KM = 1737;

// Scene scaling (1 unit = 1000km)
export const SCENE_UNIT_SCALE = 0.001; 

// Scaled constants for Three.js
export const EARTH_RADIUS = EARTH_RADIUS_KM * SCENE_UNIT_SCALE; // 6.371
export const MOON_RADIUS = MOON_RADIUS_KM * SCENE_UNIT_SCALE;   // 1.737
export const SUN_DISTANCE = 200;

// API Configuration
export const API_BASE_URL = "http://localhost:8000/api";