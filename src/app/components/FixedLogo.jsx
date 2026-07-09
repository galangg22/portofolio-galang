'use client';

import { useTheme } from '@/app/providers';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function FixedLogo() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  useEffect(() => { setMounted(true); }, []);

  const bgColor = !mounted ? 'transparent' : theme === 'dark' ? '#ffffff' : '#0a0a0a';

  return (
    <Link href="/" aria-label="Home" className="fixed top-5 left-5 md:top-8 md:left-8 z-[100] hover:scale-110 active:scale-95 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
      <div
        className="w-9 h-9 md:w-11 md:h-11 transition-colors duration-300"
        style={{
          backgroundColor: bgColor,
          WebkitMaskImage: "url('/logo-dark.svg')",
          maskImage: "url('/logo-dark.svg')",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
        aria-label="Logo"
      />
    </Link>
  );
}
