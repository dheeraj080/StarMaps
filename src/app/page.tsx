import Link from "next/link";
import About from "@/components/HomePage/About";
import Footer from "@/components/HomePage/Footer";
import Hero from "@/components/HomePage/Hero";
import More from "@/components/HomePage/More";
import Navigation from "@/components/HomePage/Navigation";
import ProductShowcase from "@/components/HomePage/ProductShowcase";
import Services from "@/components/HomePage/Services";
import Testimonials from "@/components/HomePage/Testimonials";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-zinc-800">
      <Navigation />

      <main id="main-content" className="max-w-8xl mx-auto">
        <Hero />

        {/* The Route Button */}
        <div className="flex justify-center py-12 bg-zinc-50">
          <Link
            href="/map"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-black uppercase tracking-widest text-white bg-zinc-950 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Live Star Map 🛰️
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-lime-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        <About />
        <Services />
        <ProductShowcase />
        <More />
        <Testimonials />
      </main>

      <Footer />
    </div>
  );
}
