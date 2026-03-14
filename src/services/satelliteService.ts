import * as satellite from 'satellite.js';

export interface SatelliteData {
  name: string;
  line1: string;
  line2: string;
  id: string;
  category: 'Space Station' | 'Science' | 'Weather' | 'Communication' | 'Navigation';
}

export interface SatellitePosition {
  lat: number;
  lng: number;
  alt: number;
  velocity: number;
}

export const getSatellitePosition = (tle1: string, tle2: string, date: Date = new Date()): SatellitePosition | null => {
  try {
    const satrec = satellite.twoline2satrec(tle1, tle2);
    const positionAndVelocity = satellite.propagate(satrec, date);
    
    const pos = positionAndVelocity.position;
    if (!pos || typeof pos === 'boolean') return null;

    const gmst = satellite.gstime(date);
    const positionGd = satellite.eciToGeodetic(pos, gmst);

    const longitude = satellite.degreesLong(positionGd.longitude);
    const latitude = satellite.degreesLat(positionGd.latitude);
    const altitude = positionGd.height;

    // Velocity calculation (magnitude)
    const v = positionAndVelocity.velocity;
    const velocity = (v && typeof v === 'object') ? Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) : 0;

    return {
      lat: latitude,
      lng: longitude,
      alt: altitude,
      velocity: velocity
    };
  } catch (e) {
    console.error("Error calculating satellite position", e);
    return null;
  }
};

export const getSatelliteTrajectory = (tle1: string, tle2: string, durationMinutes: number = 90, steps: number = 100): [number, number][][] => {
  const segments: [number, number][][] = [[]];
  let currentSegment = segments[0];
  const now = new Date();
  const satrec = satellite.twoline2satrec(tle1, tle2);

  let lastLng: number | null = null;

  for (let i = 0; i <= steps; i++) {
    const timeOffset = (durationMinutes * 60 * 1000) * (i / steps);
    const date = new Date(now.getTime() + timeOffset); // Future trajectory
    
    const positionAndVelocity = satellite.propagate(satrec, date);
    const pos = positionAndVelocity.position;
    if (pos && typeof pos !== 'boolean') {
      const gmst = satellite.gstime(date);
      const positionGd = satellite.eciToGeodetic(pos, gmst);
      const longitude = satellite.degreesLong(positionGd.longitude);
      const latitude = satellite.degreesLat(positionGd.latitude);

      // Antimeridian jump detection
      if (lastLng !== null && Math.abs(longitude - lastLng) > 180) {
        currentSegment = [];
        segments.push(currentSegment);
      }

      currentSegment.push([longitude, latitude]);
      lastLng = longitude;
    }
  }
  return segments.filter(s => s.length > 0);
};

// Common satellites TLE data (Static fallback if fetch fails)
export const FEATURED_SATELLITES: SatelliteData[] = [
  {
    name: "ISS (ZARYA)",
    id: "25544",
    category: "Space Station",
    line1: "1 25544U 98067A   24073.52554398  .00015634  00000-0  27816-3 0  9990",
    line2: "2 25544  51.6416  15.2255 0004415  58.1217  84.5126 15.49983944443685"
  },
  {
    name: "HUBBLE SPACE TELESCOPE",
    id: "20580",
    category: "Science",
    line1: "1 20580U 90037B   24073.53819444  .00001000  00000-0  10000-3 0  9999",
    line2: "2 20580  28.4690 148.8650 0003000  90.0000 270.0000 15.09000000184000"
  },
  {
    name: "NOAA 19",
    id: "33591",
    category: "Weather",
    line1: "1 33591U 09005A   24073.54166667  .00000100  00000-0  10000-3 0  9999",
    line2: "2 33591  99.1234 245.6789 0012345 123.4567 234.5678 14.12345678123456"
  },
  {
    name: "GPS BIIR-2 (PRN 02)",
    id: "28129",
    category: "Navigation",
    line1: "1 28129U 04001A   24073.58333333  .00000050  00000-0  10000-3 0  9999",
    line2: "2 28129  55.0000  45.0000 0010000 180.0000 180.0000  2.00567890123456"
  },
  {
    name: "GPS BIIF-1 (PRN 25)",
    id: "36585",
    category: "Navigation",
    line1: "1 36585U 10022A   24073.59375000  .00000040  00000-0  10000-3 0  9999",
    line2: "2 36585  55.0000 105.0000 0010000 180.0000 180.0000  2.00567890123456"
  },
  {
    name: "STARLINK-1007",
    id: "44713",
    category: "Communication",
    line1: "1 44713U 19074A   24073.60416667  .00015000  00000-0  60000-3 0  9999",
    line2: "2 44713  53.0000 210.0000 0001000  45.0000  90.0000 15.05000000123456"
  },
  {
    name: "STARLINK-1008",
    id: "44714",
    category: "Communication",
    line1: "1 44714U 19074B   24073.61458333  .00015000  00000-0  60000-3 0  9999",
    line2: "2 44714  53.0000 215.0000 0001000  45.0000  90.0000 15.05000000123456"
  },
  {
    name: "STARLINK-1009",
    id: "44715",
    category: "Communication",
    line1: "1 44715U 19074C   24073.62500000  .00015000  00000-0  60000-3 0  9999",
    line2: "2 44715  53.0000 220.0000 0001000  45.0000  90.0000 15.05000000123456"
  },
  {
    name: "SENTINEL-1A",
    id: "39634",
    category: "Science",
    line1: "1 39634U 14016A   24073.63541667  .00000060  00000-0  10000-3 0  9999",
    line2: "2 39634  98.1800 150.0000 0001000  90.0000 270.0000 14.59000000123456"
  },
  {
    name: "SENTINEL-2A",
    id: "40697",
    category: "Science",
    line1: "1 40697U 15028A   24073.64583333  .00000050  00000-0  10000-3 0  9999",
    line2: "2 40697  98.5600 160.0000 0001000  90.0000 270.0000 14.30000000123456"
  },
  {
    name: "METOP-B",
    id: "38771",
    category: "Weather",
    line1: "1 38771U 12049A   24073.65625000  .00000040  00000-0  10000-3 0  9999",
    line2: "2 38771  98.7000 170.0000 0001000  90.0000 270.0000 14.20000000123456"
  },
  {
    name: "METOP-C",
    id: "43689",
    category: "Weather",
    line1: "1 43689U 18087A   24073.66666667  .00000040  00000-0  10000-3 0  9999",
    line2: "2 43689  98.7000 180.0000 0001000  90.0000 270.0000 14.20000000123456"
  },
  {
    name: "LANDSAT 8",
    id: "39084",
    category: "Science",
    line1: "1 39084U 13008A   24073.67708333  .00000030  00000-0  10000-3 0  9999",
    line2: "2 39084  98.2000 190.0000 0001000  90.0000 270.0000 14.50000000123456"
  },
  {
    name: "LANDSAT 9",
    id: "49260",
    category: "Science",
    line1: "1 49260U 21088A   24073.68750000  .00000030  00000-0  10000-3 0  9999",
    line2: "2 49260  98.2000 200.0000 0001000  90.0000 270.0000 14.50000000123456"
  },
  {
    name: "IRIDIUM 100",
    id: "42737",
    category: "Communication",
    line1: "1 42737U 17030A   24073.69791667  .00000200  00000-0  10000-3 0  9999",
    line2: "2 42737  86.4000 210.0000 0001000  90.0000 270.0000 14.30000000123456"
  },
  {
    name: "IRIDIUM 101",
    id: "42738",
    category: "Communication",
    line1: "1 42738U 17030B   24073.70833333  .00000200  00000-0  10000-3 0  9999",
    line2: "2 42738  86.4000 215.0000 0001000  90.0000 270.0000 14.30000000123456"
  },
  {
    name: "GLONASS-701",
    id: "28163",
    category: "Navigation",
    line1: "1 28163U 03056A   24073.71875000  .00000050  00000-0  10000-3 0  9999",
    line2: "2 28163  64.8000 220.0000 0010000 180.0000 180.0000  2.13000000123456"
  },
  {
    name: "GLONASS-702",
    id: "28164",
    category: "Navigation",
    line1: "1 28164U 03056B   24073.72916667  .00000050  00000-0  10000-3 0  9999",
    line2: "2 28164  64.8000 225.0000 0010000 180.0000 180.0000  2.13000000123456"
  },
  {
    name: "O3B FM1",
    id: "39191",
    category: "Communication",
    line1: "1 39191U 13031A   24073.73958333  .00000010  00000-0  00000-0 0  9999",
    line2: "2 39191   0.0000 230.0000 0001000  90.0000 180.0000  5.00000000123456"
  },
  {
    name: "O3B FM2",
    id: "39192",
    category: "Communication",
    line1: "1 39192U 13031B   24073.75000000  .00000010  00000-0  00000-0 0  9999",
    line2: "2 39192   0.0000 235.0000 0001000  90.0000 180.0000  5.00000000123456"
  }
];
