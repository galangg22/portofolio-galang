"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState } from 'react';

export function FixedLogo() {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    // Magnetic pull strength (0.3 = 30% pull)
    const x = (clientX - (left + width / 2)) * 0.3;
    const y = (clientY - (top + height / 2)) * 0.3;
    setPos({ x, y });
  };

  const handleMouseLeave = () => {
    setPos({ x: 0, y: 0 });
  };

  return (
    <Link
      href="/"
      aria-label="Kembali ke Beranda"
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: pos.x === 0 && pos.y === 0 ? 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)' : 'none'
      }}
      className="fixed top-4 left-4 md:top-6 md:left-6 z-[100] group flex items-center justify-center hover:scale-110 active:scale-95"
    >
      <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full p-1.5 bg-black/80 backdrop-blur-xl border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group-hover:border-accent/60 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 flex items-center justify-center overflow-hidden">
        <Image 
          src="/favicon.ico" 
          alt="Galang Logo" 
          width={40}
          height={40}
          className="w-10 h-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        />
      </div>
    </Link>
  );
}
