"use client";
/* eslint-disable no-unused-vars */

import { motion } from "framer-motion";
import { cloneElement } from "react";
import { services } from "@/assets/data";

const Services = () => {
  return (
    <section className="bg-white px-6 py-24 md:px-12 lg:py-40 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 rounded-full border border-zinc-200 px-6 py-2 text-xs font-medium text-zinc-600"
        >
          Getting to Power On
        </motion.div>

        {/* Main Header */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="max-w-4xl text-3xl md:text-5xl font-medium leading-[1.15] tracking-tight text-zinc-900"
        >
          With half a million solar installations to date, Goreno takes care of
          all the details for you, from order to power on.{" "}
          <span className="text-zinc-400">
            Schedule a virtual consultation with a Goreno Advisor to learn more.
          </span>
        </motion.h2>

        {/* Services Cards Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-16">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
              viewport={{ once: true }}
              className="flex flex-col items-center group cursor-pointer"
            >
              {/* Image Container */}
              <div
                className={`relative h-56 w-56 md:h-64 md:w-64 overflow-hidden rounded-[2.5rem] ${service.bg} transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-zinc-200`}
              >
                {/* Image Placeholder Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />

                {service.isComingSoon && (
                  <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-white/10">
                    <div className="flex items-center gap-2 rounded-full bg-white px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-900 shadow-xl ">
                      <div className="h-1 w-1 rounded-full bg-zinc-900" />{" "}
                      Coming soon
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Icon */}
              <div className="mt-6 flex items-center gap-2 text-zinc-900 transition-colors group-hover:text-zinc-500">
                <span className="p-1.5 rounded-sm border border-zinc-200">
                  {cloneElement(service.icon, { strokeWidth: 2.5 })}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest leading-none">
                  {service.title}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
