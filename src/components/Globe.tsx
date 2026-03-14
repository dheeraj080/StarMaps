import React, { useEffect, useRef, useMemo } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Satellite {
  id: string;
  name: string;
  lat: number;
  lng: number;
  trajectory?: [number, number][][];
}

interface GlobeProps {
  satellites: Satellite[];
  selectedId?: string;
}

const Globe: React.FC<GlobeProps> = ({ satellites, selectedId }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<Map<string, maplibregl.Marker>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const dashPhase = useRef(0);
  const isInteracting = useRef(false);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;

    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [0, 0],
      zoom: 1,
      pitch: 0,
      attributionControl: false, // Cleaner way to hide attribution
    });

    map.current = m;

    m.on("load", () => {
      m.setProjection({ type: "globe" });

      m.addSource("trajectories", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Trajectory Glow (Outer Line)
      m.addLayer({
        id: "trajectories-glow",
        type: "line",
        source: "trajectories",
        paint: {
          "line-color": "#10b981",
          "line-width": ["case", ["==", ["get", "id"], ""], 0, 6],
          "line-opacity": 0.2,
          "line-blur": 4,
        },
      });

      // Trajectory Main (Inner Line)
      map.current.addLayer({
        id: "trajectories-layer",
        type: "line",
        source: "trajectories",
        paint: {
          "line-color": "#10b981",
          "line-width": 2,
          "line-opacity": 0.5,
          // Use a fixed dash pattern
          "line-dasharray": [2, 2],
        },
      });

      // Animation Loop
      const dashOffset = useRef(0);

      const animate = () => {
        // 1. Basic safety checks
        if (!map.current || !map.current.isStyleLoaded()) {
          animationFrameRef.current = requestAnimationFrame(animate);
          return;
        }

        if (!isInteracting.current) {
          // 2. Smooth Earth Rotation
          const center = map.current.getCenter();
          map.current.setCenter([center.lng + 0.05, center.lat]);

          // 3. Animate Dash Offset (much safer than dash-array)
          dashOffset.current = (dashOffset.current + 0.05) % 4;

          if (map.current.getLayer("trajectories-layer")) {
            try {
              map.current.setPaintProperty(
                "trajectories-layer",
                "line-dasharray-offset",
                dashOffset.current,
              );
            } catch (e) {
              // Ignore internal map cleanup errors
            }
          }
        }

        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
    });

    // Interaction Listeners
    const setInteracting = (val: boolean) => (isInteracting.current = val);
    m.on("mousedown", () => setInteracting(true));
    m.on("mouseup", () => setInteracting(false));
    m.on("touchstart", () => setInteracting(true));
    m.on("touchend", () => setInteracting(false));
    m.on("movestart", (e) => {
      if (e.originalEvent) setInteracting(true);
    });
    m.on("moveend", (e) => {
      if (e.originalEvent) setInteracting(false);
    });

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      m.remove();
    };
  }, []);

  // 2. Sync Data (Markers & Trajectories)
  useEffect(() => {
    const currentMap = map.current;
    if (!currentMap) return;

    const syncData = () => {
      if (!currentMap.isStyleLoaded()) return;

      // Update GeoJSON Trajectories
      const source = currentMap.getSource(
        "trajectories",
      ) as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: satellites
            .filter((s) => s.trajectory)
            .map((s) => ({
              type: "Feature",
              properties: { id: s.id },
              geometry: { type: "MultiLineString", coordinates: s.trajectory! },
            })),
        });
      }

      // Update Layer Filters based on selectedId
      const idFilter = selectedId || "NON_EXISTENT_ID";
      ["trajectories-layer", "trajectories-glow"].forEach((layerId) => {
        if (currentMap.getLayer(layerId)) {
          currentMap.setFilter(layerId, ["==", ["get", "id"], idFilter]);
        }
      });

      // Update Markers
      satellites.forEach((sat) => {
        const isSelected = sat.id === selectedId;
        let marker = markers.current.get(sat.id);

        if (!marker) {
          const el = document.createElement("div");
          el.className = "sat-marker";
          marker = new maplibregl.Marker({ element: el })
            .setLngLat([sat.lng, sat.lat])
            .addTo(currentMap);
          markers.current.set(sat.id, marker);
        } else {
          marker.setLngLat([sat.lng, sat.lat]);
        }

        // Apply visual state via classes/data-attributes
        const el = marker.getElement();
        el.dataset.selected = isSelected.toString();
      });

      // Cleanup removed satellites
      const satIds = new Set(satellites.map((s) => s.id));
      markers.current.forEach((marker, id) => {
        if (!satIds.has(id)) {
          marker.remove();
          markers.current.delete(id);
        }
      });
    };

    // If style isn't ready, wait for it
    if (!currentMap.isStyleLoaded()) {
      currentMap.once("idle", syncData);
    } else {
      syncData();
    }
  }, [satellites, selectedId]);

  return (
    <div className="group w-full h-full relative overflow-hidden bg-slate-950 rounded-xl border border-slate-800 shadow-2xl">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Overlay UI */}
      <div className="absolute bottom-4 left-4 text-[10px] font-mono text-slate-500 uppercase tracking-wider pointer-events-none z-10 bg-black/60 px-2 py-1 rounded backdrop-blur-md border border-white/5">
        MapLibre 3D • {satellites.length} Active Nodes
      </div>

      <style>{`
        .sat-marker {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #94a3b8;
          border: 1.5px solid rgba(255,255,255,0.5);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 1;
        }
        .sat-marker[data-selected="true"] {
          width: 14px;
          height: 14px;
          background-color: #10b981;
          border: 2px solid #fff;
          box-shadow: 0 0 15px #10b981, 0 0 5px #10b981 inset;
          z-index: 100;
        }
        .maplibregl-canvas { outline: none; }
      `}</style>
    </div>
  );
};

export default Globe;
