"use client";
/* eslint-disable no-unused-vars */

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Zap, Box, ShieldCheck } from "lucide-react";

import { specs } from "@/assets/data";

const More = () => {
  return (
    <section className="bg-white px-6 py-24 md:px-12 lg:py-40 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Left Column: Context & Previews */}
        <div className="flex flex-col justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mb-8 inline-block rounded-full border border-zinc-100 bg-zinc-50 px-4 py-1.5 text-[10px] uppercase tracking-widest text-zinc-500"
            >
              More about
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-medium tracking-tighter text-zinc-900 leading-[1.05] mb-8"
            >
              Solar Panel <br /> System Specs
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-md text-sm leading-relaxed text-zinc-500 mb-12"
            >
              Goreno uses solar panels that offer a sleek and modern take on
              traditional panels. With our proprietary mounting hardware, panels
              can be installed close to your roof.
            </motion.p>
          </div>

          {/* Product Preview Thumbnails */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              <span className="text-zinc-900">◆</span> Product Preview
            </div>
            <div className="flex gap-4">
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="h-32 w-32 rounded-3xl bg-zinc-100 overflow-hidden relative group cursor-pointer"
                >
                  {/* <img src="..." className="object-cover w-full h-full" /> */}

                  <img
                    src={`/images/solar-${i + 1}.jpg`}
                    alt="image"
                    className="object-cover size-full"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Spec Cards & Controls */}
        <div className="flex flex-col gap-4">
          {/* Main Dark Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="rounded-[2.5rem] bg-zinc-950 p-10 text-white"
          >
            <div className="flex justify-between items-start mb-20">
              <h3 className="text-4xl font-light tracking-tight leading-none">
                Solar Energy <br /> Design
              </h3>
              <button className="rounded-full border border-white/20 px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                View Model
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
              {specs.map((spec, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-tighter text-zinc-500">
                    <span>◆</span> {spec.label}
                  </div>
                  <div className="text-[11px] font-medium text-zinc-200">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Secondary Features Card */}
          <div className="rounded-[2.5rem] bg-zinc-50 p-6 flex justify-between items-center group cursor-pointer hover:bg-zinc-100 transition-colors">
            <div className="flex items-center gap-4 pl-4">
              <div className="text-zinc-900">
                <Box size={20} />
              </div>
              <span className="text-lg font-medium tracking-tight">
                Solar Energy Features
              </span>
            </div>
            <button className="rounded-full bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition-transform group-hover:scale-105">
              View Features
            </button>
          </div>

          {/* Warranty Card */}
          <div className="rounded-[2.5rem] bg-white border border-zinc-100 p-8 flex items-center gap-4 pl-10">
            <ShieldCheck className="text-zinc-400" size={20} />
            <span className="text-lg font-medium tracking-tight text-zinc-600">
              25-year warranty
            </span>
          </div>

          {/* Slider Controls */}
          <div className="mt-8 flex items-center justify-between px-4">
            <button className="h-12 w-12 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors">
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-2">
              {[1, 2, 3, 4].map((dot, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === 2 ? "w-4 bg-zinc-900" : "w-1.5 bg-zinc-200"}`}
                />
              ))}
            </div>

            <button className="h-12 w-12 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default More;
