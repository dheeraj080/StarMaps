"use client";

import React, { useState, useEffect } from "react";
// Import the Next.js Link component
import Link from "next/link";
import { Menu, X, Settings, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { FaSolarPanel } from "react-icons/fa";

import { navLinks } from "@/assets/data";

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDarkSection, setIsDarkSection] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight || 0;
      const footerThreshold = scrollHeight - 1000;

      setIsDarkSection(scrollY > 700 && scrollY < footerThreshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuVariants: Variants = {
    closed: {
      x: "100%",
      transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
    },
    opened: {
      x: 0,
      transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
    },
  };

  const linkVariants: Variants = {
    closed: { y: 80, opacity: 0 },
    opened: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.5,
        ease: [0.215, 0.61, 0.355, 1],
      },
    }),
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 z-40 px-6 py-6 md:px-12 backdrop-blur transition-colors duration-500 w-full flex items-center justify-between ${
          isDarkSection ? "text-zinc-950" : "text-white"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between ">
          {/* LOGO - Now links back to home */}
          <Link href="/" className="flex cursor-pointer items-center">
            <FaSolarPanel size={24} />
            <span className="ml-1 text-lg tracking-tighter uppercase font-medium">
              Georeno
            </span>
            <sup className="text-xs ml-1">®</sup>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden lg:flex gap-10">
            {navLinks.map((link: string, idx: number) => (
              <Link
                key={idx}
                // Use href property for Next.js routing
                href={
                  link.toLowerCase() === "map"
                    ? "/map"
                    : `/#${link.toLowerCase()}`
                }
                className="text-[10px] uppercase tracking-[0.3em] hover:opacity-50 transition-all font-bold"
              >
                {link}
              </Link>
            ))}
            {/* Explicit Map Link if not in navLinks */}
            <Link
              href="/map"
              className="text-[10px] uppercase tracking-[0.3em] text-lime-500 font-bold hover:opacity-70 transition-all"
            >
              Live Map
            </Link>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4">
              <button
                type="button"
                className={`p-2.5 rounded-full transition-colors ${
                  isDarkSection ? "bg-zinc-100" : "bg-white/10"
                }`}
              >
                <Settings size={16} />
              </button>
              <Link
                href="/map"
                className={`rounded-full px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                  isDarkSection
                    ? "bg-zinc-950 text-white"
                    : "bg-white text-black hover:bg-zinc-200"
                }`}
              >
                View Map
              </Link>
            </div>

            {/* MOBILE TOGGLE */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="z-50 p-2 lg:hidden relative h-10 w-10 flex items-center justify-center"
              aria-label="Toggle Menu"
            >
              {isOpen ? (
                <X size={30} className="text-white" />
              ) : (
                <Menu
                  size={30}
                  className={isDarkSection ? "text-zinc-950" : "text-white"}
                />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* FULLSCREEN MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="opened"
            exit="closed"
            className="fixed inset-0 z-40 bg-zinc-950 text-white flex flex-col justify-between p-8 pt-32"
          >
            <div className="absolute top-20 -right-20 text-[25vh] font-black text-white/5 pointer-events-none rotate-90 origin-top-right whitespace-nowrap">
              GORENO
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 mb-4">
                Navigation
              </span>
              {navLinks.map((link: string, i: number) => (
                <div key={link} className="overflow-hidden">
                  <Link
                    href={
                      link.toLowerCase() === "map"
                        ? "/map"
                        : `/#${link.toLowerCase()}`
                    }
                    onClick={() => setIsOpen(false)}
                    className="block text-6xl font-medium tracking-tighter hover:italic transition-all origin-left"
                  >
                    <motion.span
                      custom={i}
                      variants={linkVariants}
                      className="block"
                    >
                      {link}
                    </motion.span>
                  </Link>
                </div>
              ))}
              {/* Mobile Live Map Link */}
              <div className="overflow-hidden">
                <Link
                  href="/map"
                  onClick={() => setIsOpen(false)}
                  className="block text-6xl font-medium tracking-tighter text-lime-500 hover:italic transition-all origin-left"
                >
                  <motion.span
                    custom={navLinks.length}
                    variants={linkVariants}
                    className="block"
                  >
                    Live Map
                  </motion.span>
                </Link>
              </div>
            </div>

            {/* Bottom Menu Area */}
            <div className="relative z-10 border-t border-white/10 pt-8 flex flex-col gap-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
                    Contact
                  </span>
                  <p className="text-xs font-medium">hello@goreno.tech</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
                    Office
                  </span>
                  <p className="text-xs font-medium">Zurich, CH</p>
                </div>
              </div>

              <Link
                href="/map"
                onClick={() => setIsOpen(false)}
                className="w-full bg-white text-black py-6 rounded-full flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em]"
              >
                Launch Star Map <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
