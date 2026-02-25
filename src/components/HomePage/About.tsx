"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Sun, Zap } from "lucide-react";

// Assuming chartData is an array of numbers
import { chartData } from "@/assets/data";

const About: React.FC = () => {
  // State typed to allow number or null
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Explicitly typing Framer Motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="px-6 py-20 md:px-12 lg:py-32 font-sans overflow-hidden container mx-auto">
      {/* Top Header Section */}
      <div className="mb-16 flex flex-col lg:flex-row justify-between items-start gap-8">
        <div className="flex items-start gap-2">
          <Sun size={16} className="mt-1 animate-pulse text-lime-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest leading-tight">
            Save With <br /> Solar Over Time
          </span>
        </div>
        <motion.h2
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl text-3xl md:text-5xl font-medium leading-[1.1] tracking-tight text-zinc-900"
        >
          Generate your own clean energy from the sun for free with solar.
          <span className="text-zinc-400">
            {" "}
            Add Powerwall to store your energy for use anytime you need it.
          </span>
        </motion.h2>
      </div>

      {/* Grid Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Card 1: Design/Consultation */}
        <motion.div
          variants={itemVariants}
          className="relative flex flex-col justify-between rounded-[2.5rem] bg-zinc-950 p-10 text-white aspect-square lg:aspect-auto lg:min-h-[450px] group overflow-hidden"
        >
          <div className="flex justify-between items-start relative z-10">
            <Zap className="text-white" fill="currentColor" size={24} />
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="h-10 w-10 rounded-full border-2 border-zinc-950 bg-zinc-700 ring-2 ring-zinc-800 cursor-pointer overflow-hidden"
                >
                  <img
                    src={`/images/avatar-${i + 1}.png`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <h3 className="text-3xl font-light leading-tight">
              Design your solar system{" "}
              <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors duration-500">
                or schedule a virtual consultation with a Goreno.
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="h-6 w-11 rounded-full bg-zinc-800 p-1 flex items-center">
              <motion.div
                layout
                className="h-4 w-4 rounded-full bg-white shadow-lg"
              />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
              AI Energy Mode
            </span>
          </div>

          <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-white/5 blur-[80px] rounded-full group-hover:bg-white/10 transition-colors duration-700" />
        </motion.div>

        {/* Card 2: Visual Image */}
        <motion.div
          variants={itemVariants}
          className="relative flex items-center justify-center rounded-[2.5rem] bg-zinc-300 overflow-hidden aspect-square lg:aspect-auto lg:min-h-[450px] group cursor-pointer"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-zinc-400"
          >
            <img
              src="/images/card.jpg"
              alt="Solar panels"
              className="object-cover w-full h-full saturate-150"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10 flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-sm font-medium text-white backdrop-blur-xl transition-all hover:bg-white/20"
          >
            Solar energy
          </motion.button>
        </motion.div>

        {/* Card 3: Interactive Data Chart */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col rounded-[2.5rem] bg-zinc-50 p-10 text-zinc-900 aspect-square lg:aspect-auto lg:min-h-[450px] hover:shadow-xl hover:shadow-zinc-200/50 transition-shadow duration-700"
        >
          <div className="flex justify-between items-start">
            <div>
              <motion.span
                key={hoveredBar !== null ? chartData[hoveredBar] : "default"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl font-medium tracking-tighter block"
              >
                {hoveredBar !== null ? chartData[hoveredBar] : 72}%
              </motion.span>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                Consumed Energy
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm text-[9px] font-black uppercase tracking-tighter border border-zinc-100">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
              Live Metrics
            </div>
          </div>

          <div className="mt-auto flex items-end justify-between gap-1.5 h-36">
            {chartData.map((height: number, i: number) => (
              <div
                key={i}
                className="flex-1 h-full flex flex-col justify-end"
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height}%` }}
                  transition={{
                    delay: i * 0.05,
                    duration: 0.8,
                    ease: "circOut",
                  }}
                  className={`w-full cursor-pointer rounded-full transition-colors duration-300 ${
                    hoveredBar === i
                      ? "bg-zinc-900"
                      : i > 8
                        ? "bg-lime-500"
                        : "bg-zinc-200"
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
            <span>00:00</span>
            <span>02:00</span>
            <span>04:00</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer Markers */}
      <div className="mt-16 flex flex-wrap gap-8 justify-between px-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" /> 24/7
          Monitoring
        </div>
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" /> Maximum
          Control
        </div>
      </div>
    </section>
  );
};

export default About;
