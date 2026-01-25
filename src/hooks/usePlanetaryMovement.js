import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as Astronomy from "astronomy-engine";
import { getVisualPosition } from "../utils/scaling";

export function usePlanetaryMovement(planetName, baseDate, speed) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;

    // 1. Calculate the simulation date based on UI props
    const simulationTimeMs = baseDate.getTime() + (clock.elapsedTime * 1000 * speed);
    const date = new Date(simulationTimeMs);

    // 2. Get the position vector from Astronomy Engine
    const posAu = Astronomy.HelioVector(planetName, date);

    // 3. Convert AU to Scene Coordinates
    // Using an array [x,y,z] to ensure utility compatibility
    const [x, y, z] = getVisualPosition([posAu.x, posAu.y, posAu.z]);

    // 4. Update the 3D object
    ref.current.position.set(x, y, z);
    
    // 5. Add a default rotation
    ref.current.rotation.y += 0.005;
  });

  return ref;
}