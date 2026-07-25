'use client';

import { useTheme } from '@/app/providers';
import { useEffect, useState, memo, useCallback } from 'react';

export const DarkModeToggle = memo(function DarkModeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full border transition-all backdrop-blur-md shadow-lg ${
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
