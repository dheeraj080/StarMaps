"use client";

/* eslint-disable no-unused-vars */
import Link from "next/link"; // ✅ Change this
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <motion.main
      className="min-h-screen flex items-center justify-center bg-transparent px-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-3xl text-center">
        <h1 className="text-6xl md:text-7xl font-light tracking-tight">404</h1>
        <p className="mt-4 text-xl md:text-2xl font-light text-muted-foreground text-zinc-500">
          The page you are looking for can't be found.
        </p>

        <p className="mt-6 text-base font-light text-muted-foreground leading-relaxed text-zinc-400">
          It may have been moved, removed, or never existed. Try going back home
          and continue exploring.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/" // ✅ Change 'to' to 'href'
            className="inline-block px-6 py-3 border border-zinc-200 rounded text-base font-light hover:bg-zinc-900 hover:text-white transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </motion.main>
  );
}
