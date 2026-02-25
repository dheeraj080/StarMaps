"use client";

import React from "react";
import { motion } from "framer-motion";

// 1. Define the interface for a single testimonial
interface Testimonial {
  text: string;
  imageSrc: string;
  name: string;
  username: string;
}

// 2. Define props for the column sub-component
interface TestimonialsColumnProps {
  testimonials: Testimonial[];
  className?: string;
  duration?: number;
}

import { testimonials } from "@/assets/data";

// Slice the data with type safety
const firstColumn = testimonials.slice(0, 3) as Testimonial[];
const secondColumn = testimonials.slice(3, 6) as Testimonial[];
const thirdColumn = testimonials.slice(6, 9) as Testimonial[];

const TestimonialsColumn: React.FC<TestimonialsColumnProps> = ({
  testimonials,
  className,
  duration = 40,
}) => (
  <div className={className}>
    <motion.div
      animate={{
        translateY: "-50%",
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop",
      }}
      className="flex flex-col gap-6 pb-6"
    >
      {/* Duplicate the list to create the seamless infinite loop effect */}
      {[...new Array(2)].fill(0).map((_, outerIndex) => (
        <React.Fragment key={outerIndex}>
          {testimonials.map(({ text, imageSrc, name, username }, idx) => (
            <div
              key={`${name}-${outerIndex}-${idx}`}
              className="p-8 rounded-2xl bg-white border border-zinc-100 shadow-xl shadow-zinc-100"
            >
              <div className="text-zinc-600 text-sm leading-relaxed mb-6 italic">
                "{text}"
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={imageSrc}
                  alt={name}
                  className="h-10 w-10 rounded-full bg-zinc-200 object-cover"
                />
                <div className="flex flex-col">
                  <div className="text-xs font-black uppercase tracking-widest text-zinc-900 leading-none">
                    {name}
                  </div>
                  <div className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-tighter">
                    {username}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </motion.div>
  </div>
);

export const Testimonials: React.FC = () => {
  return (
    <section className="bg-zinc-50 py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="rounded-full border border-zinc-200 bg-white px-6 py-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-8">
            Testimonials
          </div>

          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter text-zinc-900 mb-6">
            Trusted by homeowners <br />
            <span className="text-zinc-300">globally.</span>
          </h2>
          <p className="max-w-md text-sm text-zinc-500 leading-relaxed font-medium">
            From intuitive design to powerful features, Goreno has become an
            essential partner for sustainable living.
          </p>
        </div>

        {/* The Marquee Grid */}
        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[700px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={20} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={25}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={18}
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
