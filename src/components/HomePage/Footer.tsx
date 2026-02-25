"use client";
/* eslint-disable no-unused-vars */

import { motion } from "framer-motion";
import {
  ArrowRight,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Company: ["About us", "Career", "Contact"],
    Product: ["Solar", "Vehicle Recalls"],
    Resources: ["News", "Press"],
  };

  const socialLinks = [
    { name: "Instagram", icon: <Instagram size={14} /> },
    { name: "Facebook", icon: <Facebook size={14} /> },
    { name: "Twitter", icon: <Twitter size={14} /> },
    { name: "Youtube", icon: <Youtube size={14} /> },
  ];

  return (
    <footer className="bg-zinc-950 text-white pt-24 pb-12 px-6 md:px-12 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Top Section: CTA & Socials */}
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-24">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-light leading-tighter tracking-tight mb-10"
            >
              Design your solar system or schedule a virtual consultation with a{" "}
              <span className="text-zinc-500 italic">Goreno Advisor</span> to
              learn more.
            </motion.h2>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 rounded-full border border-white/20 px-8 py-4 text-xs cursor-pointer uppercase tracking-[0.2em] transition-all hover:bg-white hover:text-black"
            >
              Order now <ArrowRight size={16} />
            </motion.button>
          </div>

          <div className="flex flex-col gap-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              Follow us
            </span>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <button
                  key={social.name}
                  className="flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-5 py-2.5 text-[10px] cursor-pointer uppercase tracking-widest transition-all hover:bg-zinc-800 hover:border-zinc-700"
                >
                  {social.icon} {social.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-[1px] w-full bg-white/10 mb-20" />

        {/* Bottom Section: Links & Newsletter */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-24">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                {category}
              </span>
              <ul className="flex flex-col gap-4">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 flex flex-col gap-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              Newsletter
            </span>
            <div className="relative flex items-center max-w-sm">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-transparent border border-zinc-800 rounded-full px-6 py-4 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              />
              <button className="absolute right-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-all">
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Legal Row */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
          <p>© {currentYear} Copyright Goreno Inc.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-zinc-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-zinc-300">
              Legal
            </a>
            <a href="#" className="hover:text-zinc-300">
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
