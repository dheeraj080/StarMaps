"use client";

import React, { useRef, ReactNode } from "react";
import { motion, Variants } from "framer-motion";
import { Plus, Zap, Shield, Sun } from "lucide-react";

// 1. Define the Shape of your Data
interface Spec {
  icon: ReactNode;
  title: string;
  value: string;
}

interface SpecItemProps {
  spec: Spec;
  delay: number;
  isRight?: boolean;
}

const ProductShowcase: React.FC = () => {
  // 2. Properly type the Ref
  const containerRef = useRef<HTMLElement>(null);

  const specs: Spec[] = [
    {
      icon: <Shield size={18} />,
      title: "Warranty",
      value: "10-Year Protection",
    },
    { icon: <Sun size={18} />, title: "Operation", value: "24/7 Autonomy" },
    { icon: <Zap size={18} />, title: "Switch", value: "<10ms Seamless" },
    { icon: <Plus size={18} />, title: "System", value: "Modular Expansion" },
  ];

  return (
    <section
      ref={containerRef}
      className="bg-white py-24 md:py-40 lg:py-48 font-sans overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Cinematic Header */}
        <div className="relative mb-20 md:mb-32">
          <motion.span
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 0.03, x: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute -top-12 -left-4 text-[12vw] font-black leading-none select-none pointer-events-none whitespace-nowrap"
          >
            POWERWALL
          </motion.span>

          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-100 bg-white shadow-lg"
            >
              <Zap size={18} className="text-zinc-900" fill="currentColor" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-zinc-950 mb-6 leading-[0.9]"
            >
              The New <span className="text-zinc-300">Standard.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="max-w-lg text-sm md:text-base text-zinc-400 font-medium tracking-tight leading-relaxed"
            >
              Engineering meets elegance in our most powerful home storage
              solution yet.
            </motion.p>
          </div>
        </div>

        {/* The "Wow" Visual */}
        <div className="relative w-full rounded-[2.5rem] md:rounded-[4rem] bg-zinc-950 p-6 md:p-12 lg:p-20 overflow-hidden shadow-2xl group">
          <div className="absolute top-0 right-0 h-[300px] w-[300px] md:h-[500px] md:w-[500px] bg-zinc-800/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
            {/* Left Column: Specs */}
            <div className="w-full lg:col-span-3 space-y-8 md:space-y-12 order-2 lg:order-1">
              {specs.slice(0, 2).map((spec, i) => (
                <SpecItem key={i} spec={spec} delay={i * 0.1} />
              ))}
            </div>

            {/* Center: The Product */}
            <div className="w-full lg:col-span-6 flex justify-center order-1 lg:order-2 px-4 md:px-0">
              <motion.div
                whileHover={{ scale: 1.02, rotateY: 8 }}
                transition={{ type: "spring", stiffness: 60, damping: 20 }}
                className="relative w-full max-w-[450px] aspect-[3/4] md:aspect-auto"
              >
                <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-75 opacity-50" />
                <img
                  src="/images/solar-0.png"
                  alt="Powerwall 3"
                  className="w-full h-auto max-h-[400px] md:max-h-[600px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                />
              </motion.div>
            </div>

            {/* Right Column: Specs */}
            <div className="w-full lg:col-span-3 space-y-8 md:space-y-12 order-3">
              {specs.slice(2, 4).map((spec, i) => (
                <SpecItem key={i} spec={spec} delay={i * 0.1} isRight />
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 md:mt-24 flex flex-col md:flex-row justify-between items-center gap-8 pt-10 border-t border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-7 w-7 md:h-9 md:w-9 rounded-full border-2 border-zinc-950 bg-zinc-900 flex items-center justify-center text-[8px] font-bold text-zinc-400"
                  >
                    0{i}
                  </div>
                ))}
              </div>
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Installation Guide
              </span>
            </div>

            <button
              type="button"
              className="w-full md:w-auto group relative overflow-hidden rounded-full bg-white px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-950 transition-all hover:bg-zinc-100"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Configure System <Plus size={14} />
              </span>
            </button>
          </div>
        </div>

        {/* Technical Attribution Footnote */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300 text-center">
          <span>Model: P-03 // GORENO_LABS</span>
          <span className="hidden md:inline">◆</span>
          <span>Available Q3 2026</span>
        </div>
      </div>
    </section>
  );
};

// 3. Typed Sub-component
const SpecItem: React.FC<SpecItemProps> = ({ spec, delay, isRight }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className={`group/item cursor-default w-full ${isRight ? "lg:text-right" : "text-left"}`}
  >
    <div
      className={`flex items-center gap-3 mb-3 text-zinc-500 group-hover/item:text-white transition-colors ${isRight ? "lg:justify-end" : "justify-start"}`}
    >
      {spec.icon}
      <span className="text-[9px] font-black uppercase tracking-[0.2em]">
        {spec.title}
      </span>
    </div>
    <div className="text-xl md:text-2xl font-light text-zinc-100 tracking-tight transition-all">
      {spec.value}
    </div>
    <div className="h-[1px] w-full bg-zinc-800/50 mt-5 group-hover/item:bg-zinc-500 transition-colors" />
  </motion.div>
);

export default ProductShowcase;
