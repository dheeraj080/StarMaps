"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import SattrackIcon from "@/assets/sattrack_icon_noframe";

export default function HomePage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    router.prefetch("/StarMaps");

    // Force-load the MapView chunk in background
    import("@/components/MapView").catch(() => {});
  }, [router]);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div
      className={`relative h-screen w-screen flex items-center justify-center ${isDark ? "bg-black text-white" : "bg-slate-100 text-black"}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_60%)]" />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6">
        <SattrackIcon size={80} color={isDark ? "#fff" : "#000"} />
        <h1 className="text-4xl font-semibold">StarMaps Home</h1>
        <p className="max-w-md opacity-70">
          Real-time satellite tracking on an interactive globe.
        </p>

        {/* Use Link so Next also prefetches */}
        <Link href="/StarMaps" prefetch>
          <Button size="lg" className="px-12">
            Enter Tracker
          </Button>
        </Link>
      </div>
    </div>
  );
}
