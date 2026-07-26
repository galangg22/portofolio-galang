"use client";

import { ReactLenis } from 'lenis/react';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function SmoothScroll({ children }) {
  const lenisRef = useRef();
  const pathname = usePathname();

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  // Matikan smooth scroll (Lenis) untuk halaman admin agar tidak konflik dengan dnd-kit dan dynamic height CMS
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <ReactLenis 
      root 
      ref={lenisRef} 
      autoRaf={false}
      options={{
        lerp: 0.08,
        duration: 1.5,
        smoothWheel: true,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
    >
      {children}
    </ReactLenis>
  );
}
