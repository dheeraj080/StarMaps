import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import {
  Satellite,
  Activity,
  Globe as GlobeIcon,
  Info,
  Navigation,
  Clock,
  Search,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
const Globe = lazy(() => import("./components/Globe"));
import {
  getSatellitePosition,
  getSatelliteTrajectory,
  FEATURED_SATELLITES,
  SatellitePosition,
} from "./services/satelliteService";

export default function App() {
  // --- State ---
  const [selectedSatId, setSelectedSatId] = useState<string>(
    FEATURED_SATELLITES[0].id,
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [satPositions, setSatPositions] = useState<
    Record<string, SatellitePosition>
  >({});
  const [satTrajectories, setSatTrajectories] = useState<
    Record<string, [number, number][][]>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [packetsReceived, setPacketsReceived] = useState(0);
  const [logs, setLogs] = useState<{ time: string; event: string }[]>([]);

  // --- Derived Data (Memoized) ---
  const categories = useMemo(
    () => ["All", ...new Set(FEATURED_SATELLITES.map((s) => s.category))],
    [],
  );

  const filteredSats = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return FEATURED_SATELLITES.filter((sat) => {
      const matchesSearch =
        sat.name.toLowerCase().includes(query) || sat.id.includes(query);
      const matchesCategory =
        selectedCategory === "All" || sat.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const selectedSat = useMemo(
    () => FEATURED_SATELLITES.find((s) => s.id === selectedSatId),
    [selectedSatId],
  );

  const currentPos = satPositions[selectedSatId];

  // --- Side Effects ---

  // 1. Heavy Lift: Trajectory Calculations (Calculated less often)
  useEffect(() => {
    const updateTrajectories = () => {
      const updated: Record<string, [number, number][][]> = {};
      FEATURED_SATELLITES.forEach((sat) => {
        // We only calculate trajectories for the selected sat frequently,
        // and others only once or on long intervals to save CPU.
        updated[sat.id] = getSatelliteTrajectory(sat.line1, sat.line2, 90, 100);
      });
      setSatTrajectories(updated);
    };

    updateTrajectories();
    const trajInterval = setInterval(updateTrajectories, 60000); // Refresh all orbits every minute
    return () => clearInterval(trajInterval);
  }, []);

  // 2. High Frequency: Positions, Time, and Logs (1 second interval)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Update Packets
      setPacketsReceived((prev) => prev + Math.floor(Math.random() * 5) + 1);

      // Calculate new positions for all satellites
      const newPositions: Record<string, SatellitePosition> = {};
      FEATURED_SATELLITES.forEach((sat) => {
        const pos = getSatellitePosition(sat.line1, sat.line2, now);
        if (pos) newPositions[sat.id] = pos;
      });
      setSatPositions(newPositions);

      // Random Log Generation
      if (Math.random() > 0.95) {
        const randomSat =
          FEATURED_SATELLITES[
            Math.floor(Math.random() * FEATURED_SATELLITES.length)
          ];
        const events = [
          "Signal Lock Re-established",
          "Telemetry Packet Received",
          "Orbital Correction Applied",
          "Entering Eclipse Phase",
          "Sensor Calibration Complete",
        ];
        const newLog = {
          time: now.toLocaleTimeString([], {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          event: `${randomSat.name}: ${events[Math.floor(Math.random() * events.length)]}`,
        };
        setLogs((prev) => [newLog, ...prev].slice(0, 10));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 3. Globe Data Preparation
  const globeSatellites = useMemo(() => {
    return FEATURED_SATELLITES.map((s) => ({
      id: s.id,
      name: s.name,
      lat: satPositions[s.id]?.lat || 0,
      lng: satPositions[s.id]?.lng || 0,
      trajectory: satTrajectories[s.id] || [],
    }));
  }, [satPositions, satTrajectories]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#E4E3E0] font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Satellite className="text-black w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">
              StarMaps
            </h1>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              Global Satellite Telemetry
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 font-mono text-[11px] uppercase tracking-wider">
          <div className="flex flex-col items-end">
            <span className="text-white/40">Packets Received</span>
            <span className="text-emerald-500 font-bold">
              {packetsReceived.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-white/40">Tracked Satellites</span>
            <span className="text-emerald-500 font-bold">
              {FEATURED_SATELLITES.length}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-white/40">System Status</span>
            <div className="flex items-center gap-3">
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 font-bold">
                <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
                LIVE FEED
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end w-24">
            <span className="text-white/40">UTC TIME</span>
            <span className="tabular-nums">
              {currentTime.toISOString().split("T")[1].split(".")[0]}
            </span>
          </div>
        </div>
      </header>

      <main className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-400 mx-auto">
        {/* Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-[calc(100vh-140px)]">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="SEARCH SATELLITES..."
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-emerald-500/50 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider border transition-all ${
                    selectedCategory === cat
                      ? "bg-emerald-500 text-black border-emerald-500"
                      : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {filteredSats.map((sat) => (
              <button
                key={sat.id}
                onClick={() => setSelectedSatId(sat.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                  selectedSatId === sat.id
                    ? "bg-emerald-500/10 border-emerald-500/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-white/40 uppercase">
                      NORAD: {sat.id}
                    </span>
                    <span className="text-[8px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-white/60 w-fit">
                      {sat.category}
                    </span>
                  </div>
                  {selectedSatId === sat.id && (
                    <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                  )}
                </div>
                <h3 className="font-bold text-sm tracking-tight group-hover:text-emerald-400 transition-colors uppercase">
                  {sat.name}
                </h3>
              </button>
            ))}
          </div>
        </div>

        {/* Main Visualization */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="relative w-full h-150 bg-slate-950 rounded-xl overflow-hidden">
            <Suspense
              fallback={
                <div className="flex items-center justify-center w-full h-full bg-black/50 backdrop-blur-md">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-emerald-500/70 text-sm font-medium">
                      Initializing Globe...
                    </p>
                  </div>
                </div>
              }
            >
              <Globe satellites={globeSatellites} selectedId={selectedSatId} />
            </Suspense>
          </div>
          {/* Telemetry Stats 
          
          */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Latitude",
                value: currentPos?.lat.toFixed(4) + "°",
                icon: Navigation,
              },
              {
                label: "Longitude",
                value: currentPos?.lng.toFixed(4) + "°",
                icon: GlobeIcon,
              },
              {
                label: "Altitude",
                value: currentPos?.alt.toFixed(0) + " km",
                icon: Activity,
              },
              {
                label: "Velocity",
                value: (currentPos?.velocity || 0).toFixed(2) + " km/s",
                icon: Zap,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-2 text-white/40">
                  <stat.icon className="w-3 h-3" />
                  <span className="text-[10px] font-mono uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <div className="text-xl font-bold font-mono tracking-tighter text-emerald-400 tabular-nums">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Info className="w-4 h-4 text-emerald-500" />
              <h2 className="text-xs font-mono uppercase tracking-widest font-bold">
                Satellite Profile
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                  Designation
                </label>
                <p className="text-sm font-bold">{selectedSat?.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                    Catalog ID
                  </label>
                  <p className="text-sm font-mono">{selectedSat?.id}</p>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                    Status
                  </label>
                  <p className="text-sm text-emerald-500 font-bold italic">
                    NOMINAL
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <label className="text-[10px] font-mono text-white/40 uppercase block mb-3">
                  Raw TLE Data
                </label>
                <div className="bg-black p-3 rounded-lg border border-white/5 font-mono text-[9px] leading-relaxed text-white/60 overflow-x-auto scrollbar-hide">
                  <p className="whitespace-nowrap">{selectedSat?.line1}</p>
                  <p className="whitespace-nowrap">{selectedSat?.line2}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-emerald-500" />
              <h2 className="text-xs font-mono uppercase tracking-widest font-bold">
                Mission Log
              </h2>
            </div>
            <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
              <AnimatePresence initial={false}>
                {logs.map((log, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={`${log.time}-${i}`}
                    className="flex gap-3 text-[9px] font-mono leading-tight"
                  >
                    <span className="text-emerald-500/60 shrink-0">
                      {log.time}
                    </span>
                    <span className="text-white/50">{log.event}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 p-6 mt-12 opacity-50">
        <div className="max-w-400 mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono uppercase tracking-[0.2em]">
          <p>StarMaps • VER 3.4.0-GL</p>
          <div className="flex gap-8">
            <span>Latent Uplink: 42ms</span>
            <span>Region: Orbital-Low-Earth</span>
          </div>
        </div>
      </footer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.3); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `,
        }}
      />
    </div>
  );
}
