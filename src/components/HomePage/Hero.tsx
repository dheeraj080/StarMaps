"use client";

import { motion } from "framer-motion";
import { Sun, Leaf } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-zinc-900 text-white font-sans flex flex-col">
      {/* Background Image Placeholder */}
      <div className="absolute inset-0 z-0 bg-[url(/images/hero.jpg)] bg-cover bg-center saturate-150">
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent z-10" />
      </div>

      {/* 💠 Main Content Area */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 md:px-12 container mx-auto">
        {/* Massive Headline - Fluid Typography */}
        <div className="flex flex-col justify-center flex-1">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-[110px] md:text-[24vw] font-bold leading-[0.75] tracking-tighter text-white/80 relative"
          >
            Goreno{" "}
            <sup className="text-lg md:text-2xl 2xl:text-3xl absolute md:top-5 lg:top-10 lg:right-40 2xl:right-0 2xl:top-20">
              ®
            </sup>
          </motion.h1>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto flex flex-col md:flex-row items-start md:items-end justify-between pb-10 gap-8 md:gap-0">
          {/* Left: Solar Energy Badge - Refined for Mobile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative flex items-center gap-4 pt-6"
          >
            {/* The custom L-shaped border from the reference */}
            <div className="absolute top-0 left-0 w-24 border-t border-white/40" />
            <div className="absolute top-0 left-0 h-16 border-l border-white/40" />

            <div className="flex flex-col gap-1 pl-4">
              <Sun size={20} className="text-zinc-100" />
              <Leaf size={16} className="text-zinc-400" />
            </div>
            <span className="text-2xl md:text-4xl font-light tracking-tight">
              Solar energy
            </span>
          </motion.div>

          {/* Right: Description - Left aligned on mobile, Right on Desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-xs md:max-w-sm md:text-right"
          >
            <p className="text-xs md:text-sm leading-relaxed text-zinc-200">
              Generate your own clean energy from the sun for free with solar.
              Add Powerwall to store your energy for use anytime.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Background centerline - Hidden on small mobile to reduce clutter */}
      <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white/5 z-0 hidden sm:block" />
    </section>
  );
};

export default Hero;
