export function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function latLonToTileXY(latDeg: number, lonDeg: number, z: number) {
  const lat = clamp(latDeg, -85.05112878, 85.05112878) * Math.PI / 180;
  const n = 2 ** z;

  const x = Math.floor(((lonDeg + 180) / 360) * n);
  const y = Math.floor(
    (1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2 * n
  );

  return { x: ((x % n) + n) % n, y: clamp(y, 0, n - 1) };
}

export function tileXYToLatLonBounds(x: number, y: number, z: number) {
  const n = 2 ** z;

  const lonLeft = (x / n) * 360 - 180;
  const lonRight = ((x + 1) / n) * 360 - 180;

  const latTop = radToDeg(Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))));
  const latBottom = radToDeg(Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n))));

  return { latTop, latBottom, lonLeft, lonRight };
}

export function latLonToUnitSphere(latDeg: number, lonDeg: number) {
  const lat = latDeg * Math.PI / 180;
  const lon = lonDeg * Math.PI / 180;

  return {
    x: Math.cos(lat) * Math.cos(lon),
    y: Math.sin(lat),
    z: Math.cos(lat) * Math.sin(lon),
  };
}

function radToDeg(r: number) { return r * 180 / Math.PI; }
