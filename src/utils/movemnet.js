import * as Astronomy from "astronomy-engine";
import { getVisualPosition } from "./scaling";

/**
 * Calculates the exact [x, y, z] for a planet at a specific time
 * @param {string} name - Planet name (e.g., "Earth")
 * @param {Date} baseDate - The start date from your UI
 * @param {number} elapsed - clock.elapsedTime from Three.js
 * @param {number} speed - speed multiplier from your UI
 */
export const calculatePlanetaryPosition = (name, baseDate, elapsed, speed) => {
  // 1. Calculate the current simulation time
  const simTimeMs = baseDate.getTime() + (elapsed * 1000 * speed);
  const date = new Date(simTimeMs);

  // 2. Get the raw vector from the engine
  const vector = Astronomy.HelioVector(name, date);

  // 3. IMPORTANT: Convert the object {x, y, z} into an array [x, y, z]
  // This is usually why planets "disappear" (scaling functions expect arrays)
  const posArray = [vector.x, vector.y, vector.z];

  // 4. Scale it for the 3D scene
  return getVisualPosition(posArray);
};