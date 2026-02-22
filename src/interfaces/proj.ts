/**
 * This file contains the interfaces and types related to the projection of the map.
 * For more information, visit: https://visgl.github.io/react-map-gl/docs/api-reference/map
 */

export type ProjectionType =
  | "globe"
  | "mercator"
  | "albers"
  | "equalEarth"
  | "equirectangular"
  | "lambertConformalConic"
  | "naturalEarth"
  | "winkelTripel";

export const ProjectionTypes: Array<{ identifier: ProjectionType; label: string }> = [
  { identifier: "globe", label: "Globe" },
  { identifier: "mercator", label: "Mercator" },
  { identifier: "equalEarth", label: "Equal Earth" },
  { identifier: "naturalEarth", label: "Natural Earth" },
  { identifier: "winkelTripel", label: "Winkel Tripel" },
  { identifier: "equirectangular", label: "Equirectangular" },
  { identifier: "lambertConformalConic", label: "Lambert Conformal Conic" },
  { identifier: "albers", label: "Albers" },
];