export type Launch = {
  id: string | number;
  name: string;

  // used in LaunchLayer.tsx
  pad_lat: number;
  pad_lon: number;

  // countdown + display
  net_utc: string; // ISO string
};