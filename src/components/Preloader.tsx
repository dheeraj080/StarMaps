import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import SattrackIcon from "../assets/sattrack_icon_noframe";
import { Progress } from "@/components/ui/progress";

interface PreloaderProps {
  progress: number;
}

export const Preloader: React.FC<PreloaderProps> = ({ progress }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden flex items-center justify-center
        ${isDark ? "bg-black" : "bg-slate-100"}`}
    >
      {/* Subtle radial space glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_60%)]" />

      {/* Star layer */}
      <div className="absolute inset-0 opacity-20 bg-[url('/stars.png')] bg-cover animate-pulse" />

      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        {/* Logo */}
        <SattrackIcon size={64} color={isDark ? "#ffffff" : "#000000"} />

        {/* Title */}
        <h1 className="text-2xl font-semibold tracking-wide">
          Establishing Orbital Link...
        </h1>

        {/* Progress */}
        <div className="w-64 mt-2">
          <Progress value={progress} />
        </div>

        <span className="text-sm opacity-60">
          Syncing satellite telemetry • {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};
