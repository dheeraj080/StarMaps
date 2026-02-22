"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

// IMPORTANT: use the MapLibre entrypoint so react-map-gl doesn't try to import mapbox-gl
import { Map, Source, Layer, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { useTLEData } from "../context/TLEContext";
import { OrbitData } from "../interfaces/tle";
import {
  calculateCurrentSpeed,
  calculateOrbit,
  getClassification,
} from "../utils/TLEutils";
import { orbitLayerPassive } from "../consts/mapstyles";
import { createOrbitGeometry } from "../utils/geometry";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import SatelliteMarker from "./SatelliteMarker";
import { StatusBadge } from "./StatusBadge";
import { ProjectionController } from "./ProjectionController";
import { ProjectionType } from "../interfaces/proj";
import { ModeToggle } from "./ModeToggle";

export const MapView: React.FC = () => {
  const { theme } = useTheme();

  // Free public basemap styles (no token required)
  const lightMapStyle =
    "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
  const darkMapStyle =
    "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

  const { tleData, countdown, progress } = useTLEData();

  const { latitude, longitude } = { latitude: 52, longitude: 13 };

  const [isLoading, setIsLoading] = useState(true);
  const [orbits, setOrbits] = useState<OrbitData[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [projection, setProjection] = useState<ProjectionType>("globe");

  useEffect(() => {
    if (tleData && tleData.length > 0) {
      setIsLoading(true);

      const orbitData = tleData.map((tle) => {
        const orbit = calculateOrbit(tle);
        const velocity = calculateCurrentSpeed(tle);
        const classification = getClassification(tle);
        const [orbitA, orbitB] = createOrbitGeometry(orbit);

        return {
          id: tle.info.satid.toString(),
          name: tle.info.satname,
          classification,
          velocity,
          lat: orbit[0][1],
          lng: orbit[0][0],
          orbitA,
          orbitB,
        };
      });

      setOrbits(orbitData);
      setIsOnline(true);
      setIsLoading(false);
    }
  }, [tleData]);

  return (
    <div className="w-full h-[100vh]">
      <div className="absolute z-10 m-2">
        <StatusBadge isOnline={isOnline} />
        <p className="mt-1">Next update in: {countdown} seconds</p>
      </div>

      <div className="absolute flex flex-row gap-2 items-center z-10 m-2 right-0">
        <ModeToggle />
        <ProjectionController
          projection={projection}
          setProjection={setProjection}
        />
      </div>

      <Map
        initialViewState={{
          longitude: 0, // Center on Prime Meridian
          latitude: 0, // Equator
          zoom: 3, // Zoomed out enough to see curvature
          pitch: 0, // Flat = perfectly centered globe
          bearing: 0,
        }}
        mapStyle={theme === "dark" ? darkMapStyle : lightMapStyle}
        attributionControl={false}
        projection={{ type: projection }} // ✅ this sets it at construction
      >
        {orbits.map((orbit) => (
          <React.Fragment key={orbit.id}>
            <Drawer>
              <DrawerTrigger asChild>
                <Marker latitude={orbit.lat} longitude={orbit.lng}>
                  <SatelliteMarker sat={orbit} />
                </Marker>
              </DrawerTrigger>

              <DrawerContent className="focus:outline-none">
                <div className="mx-auto w-full max-w-sm mb-10">
                  <DrawerHeader>
                    <DrawerTitle className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-center">
                      {orbit.name}
                    </DrawerTitle>
                    <h4 className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0 text-center">
                      ID {orbit.id}
                    </h4>
                  </DrawerHeader>

                  <DrawerFooter>
                    <p>Classification: {orbit.classification}</p>
                    <p>
                      Position:{" "}
                      {orbit.lat.toFixed(6) + ", " + orbit.lng.toFixed(6)}
                    </p>
                    <p>Velocity: {orbit.velocity.toFixed(2)} km/s</p>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>

            <Source type="geojson" data={orbit.orbitA}>
              <Layer id={`lineA-${orbit.id}`} {...orbitLayerPassive} />
            </Source>
            <Source type="geojson" data={orbit.orbitB}>
              <Layer id={`lineB-${orbit.id}`} {...orbitLayerPassive} />
            </Source>
          </React.Fragment>
        ))}
      </Map>
    </div>
  );
};
