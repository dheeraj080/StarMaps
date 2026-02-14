// hooks/useSatellites.ts
import useSWR from 'swr';
import * as satellite from 'satellite.js';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useSatellites() {
  const { data, error } = useSWR('http://localhost:8000/api/satellites', fetcher, {
    refreshInterval: 1000 * 60 * 60, // Re-check every hour
  });

  // Pre-parse the TLEs into SatRec objects for performance
  const satRecords = data?.satellites.map((s: any) => ({
    name: s.name,
    satrec: satellite.twoline2satrec(s.line1, s.line2),
  })) || [];

  return {
    satellites: satRecords,
    isLoading: !error && !data,
    isError: error
  };
}