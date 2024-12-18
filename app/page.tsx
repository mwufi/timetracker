"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export default function Home() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY;
        parallaxRef.current.style.transform = `translateY(-${scrolled * 0.4}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-[150vh] relative">
      <div
        ref={parallaxRef}
        className="fixed top-0 left-0 w-full h-screen overflow-hidden"
      >
        <Image
          src="/analog_interior_large.webp"
          alt="Analog Interior"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="fixed top-14 left-12 z-10">
        <h1 className="text-6xl font-serif text-white">
          Zen, n.
        </h1>
      </div>
      <div className="h-[50vh]"></div>

      <div className="h-screen" />
      <div className="h-[95vh] bg-white flex items-center justify-center">
        <input 
          type="text" 
          placeholder="search anything"
          className="w-96 px-6 py-4 text-lg rounded-full border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>
    </div>
  );
}
