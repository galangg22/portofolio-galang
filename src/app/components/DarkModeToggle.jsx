'use client';

import { useTheme } from '@/app/providers';
import { useEffect, useState, memo, useCallback, useRef } from 'react';

export const DarkModeToggle = memo(function DarkModeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.3;
    const y = (clientY - (top + height / 2)) * 0.3;
    setPos({ x, y });
  };

  const handleMouseLeave = () => {
    setPos({ x: 0, y: 0 });
  };

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <button
      ref={btnRef}
      onClick={toggleTheme}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transform: `translate(${pos.x}px, ${pos.y}px) ${isDark ? 'rotate(0deg)' : 'rotate(180deg)'}`,
        transition: pos.x === 0 && pos.y === 0 ? 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1), background-color 0.3s, border-color 0.3s' : 'background-color 0.3s, border-color 0.3s'
      }}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full border backdrop-blur-md shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 ${
        isDark
          ? 'bg-white/10 border-white/20 hover:bg-white/20'
          : 'bg-black/10 border-black/20 hover:bg-black/15'
      }`}
      aria-label="Toggle dark mode"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <i className="ri-sun-line text-xl text-yellow-400" />
      ) : (
        <i className="ri-moon-line text-xl text-blue-500" />
      )}
    </button>
  );
});
