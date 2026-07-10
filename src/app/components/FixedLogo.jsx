'use client';

import { useTheme } from '@/app/providers';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function FixedLogo() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  useEffect(() => { setMounted(true); }, []);

  const isDark = !mounted ? true : theme === 'dark';

  return (
    <Link href="/" aria-label="Home" className="fixed top-5 left-5 md:top-8 md:left-8 z-[100] hover:scale-110 active:scale-95 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
      <img
        src="/logo-dark.svg"
        alt="Galang Arrauf Pramudito Logo"
        className="w-9 h-9 md:w-11 md:h-11 transition-all duration-300 object-contain block"
        style={{
          filter: isDark ? "none" : "invert(1) hue-rotate(180deg)",
        }}
      />
    </Link>
  );
}
