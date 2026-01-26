import * as Astronomy from "astronomy-engine";
import { getVisualVector } from "./scaling";

export function packOrbitBands(planets, getVisualRadius, opts = {}) {
  const {
    baseDate = new Date(Date.UTC(2000, 0, 1)),
    radiusMultiplier = 2,
    paddingFactor = 5.5,
    safeGap = 5000,
  } = opts;

  // base orbit radius from ephemeris (non-linear) — inner → outer
  const sorted = [...planets].sort((a, b) => {
    const ra = getVisualVector(Astronomy.HelioVector(a.name, baseDate)).radius;
    const rb = getVisualVector(Astronomy.HelioVector(b.name, baseDate)).radius;
    return ra - rb;
  });

  const bands = new Map();
  let lastR = 0;
  let lastBodyR = 0;

  for (const p of sorted) {
    const { radius: baseScaledR } = getVisualVector(Astronomy.HelioVector(p.name, baseDate));
    const visualR = getVisualRadius(p);

    // Your “intended” radius for this orbit
    const desired =
      baseScaledR * radiusMultiplier + visualR * paddingFactor;

    // Hard guarantee: never overlap previous planet band
    const minAllowed =
      lastR + (lastBodyR + visualR) * paddingFactor + safeGap;

    const finalR = Math.max(desired, minAllowed);

    bands.set(p.name, finalR);
    lastR = finalR;
    lastBodyR = visualR;
  }

  return bands; // Map(name -> finalOrbitRadius)
}
